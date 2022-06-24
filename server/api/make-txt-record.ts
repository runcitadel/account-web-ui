import Cloudflare from 'cloudflare';

const cloudflare = new Cloudflare({
  token: process.env.CLOUDFLARE_API_TOKEN as string
});

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'POST') {
    event.res.statusCode = 405;
    event.res.setHeader('Allow', 'POST, PUT');
    return {};
  }
  const body: {
      name?: string;
      verifyMsg?: string;
    } = await useBody(event);
  if (!body.name || !body.verifyMsg) {
    event.res.statusCode = 400;
    return {
      error: 'Missing name or verifyMsg'
    };
  }
  if (body.name.includes('.') || body.name.length > 50 || body.verifyMsg.length > 200) {
    event.res.statusCode = 400;
    return {
      error: 'Invalid data'
    };
  }
  cloudflare.dnsRecords.add(process.env.CLOUDFLARE_ZONE_ID as string, {
    type: 'TXT',
    name: `_acme-challenge.${body.name}`,
    content: body.verifyMsg,
    ttl: 60
  });
  return {
    data: 'Success!'
  };
});
