import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { SupabaseClient } from "@supabase/supabase-js"
import { Database } from '~~/types/db';
import * as crypto from 'crypto';
import cloudflare from "cloudflare";

// Generate a random hex string with the given length
const randomString = (length: number) => crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);

type ApiResponse = {
    host: string;
} | {
    error: string;
};

export default defineEventHandler(async (event): Promise<ApiResponse> => {
    const cf = new cloudflare({
        token: process.env.CLOUDFLARE_TOKEN
    });
    if (event.req.method !== 'POST' && event.req.method !== 'PUT') {
        event.res.statusCode = 405;
        event.res.setHeader('Allow', 'POST, PUT');
        return {
            error: "Method not allowed"
        };
    }
    const user = await serverSupabaseUser(event);
    const supabase = serverSupabaseServiceRole(event) as SupabaseClient<Database>;
    const body: {
        onionUrl?: string;
        btcpay_compat?: boolean;
    } = await useBody(event);

    if (typeof body?.onionUrl !== 'string') {
        event.res.statusCode = 400;
        return {
            error: 'Invalid data'
        };
    }

    let host = "";
    // We keep track of the backups in Supabase and store the actual backups in Backblaze
    const { count, data } = await supabase.from("reverse_proxies").select().eq("owner", user.id);
    if (count === 0 || !data || !data[0] || !data[0].host) {
        // New account
        host = `${randomString(8)}.runcitadel.space`;
        try {
            await cf.dnsRecords.add(process.env.CLOUDFLARE_ZONE_ID, {
                type: "A",
                name: host.replace(".runcitadel.space", ""),
                content: process.env.PROXY_ORIGIN_IP,
                ttl: 3600,
                proxied: true,
            });
        } catch (error) {
            console.error(error);
            return {
                error: "Error adding DNS record"
            };
        }
    } else {
        host = data[0].host;
    }

    const { error } = await supabase.from("reverse_proxies").upsert({
        host,
        target_url: body.onionUrl,
        owner: user.id,
        btcpay_compat: body.btcpay_compat || false
    });

    if (error) {
        event.res.statusCode = 500;
        return {
            error: error.message
        };
    }
    event.res.statusCode = 200;
    return {
        host,
    };
});
