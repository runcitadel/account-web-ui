import { randomUUID } from 'crypto';
import { SupabaseClient } from '@supabase/supabase-js';
import Backblaze from 'backblaze-b2';
import filenamify from 'filenamify';

const backblaze = new Backblaze({
  applicationKeyId: process.env.BACKBLAZE_KEY_ID,
  applicationKey: process.env.BACKBLAZE_APP_KEY
});

const supabase = new SupabaseClient(process.env.SUPABASE_URL, process.env.SUPABASE_ADMIN_KEY);

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'POST' && event.req.method !== 'PUT') {
    event.res.statusCode = 405;
    event.res.setHeader('Allow', 'POST, PUT');
    return {};
  }
  await backblaze.authorize();
  const body: {
    name?: string;
    data?: string;
  } = await useBody(event);

  if (typeof body?.name !== 'string' || typeof body?.data !== 'string') {
    event.res.statusCode = 400;
    return {
      error: 'Invalid data'
    };
  }

  // We keep track of the backups in Supabase and store the actual backups in Backblaze
  const backupId = randomUUID();
  const { error } = await supabase.from('Backups').insert({
    key: body?.name,
    backup_id: backupId
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    event.res.statusCode = 500;
    return {
      error: 'Internal server error'
    };
  }

  const uploadId = await backblaze.getUploadUrl({
    bucketId: process.env.BACKBLAZE_BUCKET_ID
  });

  const file = Buffer.from(body.data, 'base64');

  await backblaze.uploadFile({
    uploadUrl: uploadId.data.uploadUrl,
    uploadAuthToken: uploadId.data.authorizationToken,
    data: file,
    fileName: `${filenamify(body.name)}/${backupId}`
  });

  return {
    id: backupId
  };
});
