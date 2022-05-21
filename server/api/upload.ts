import { randomUUID } from 'crypto';
import { SupabaseClient } from '@supabase/supabase-js';
import Backblaze from 'backblaze-b2';

const backblaze = new Backblaze({
  applicationKeyId: process.env.BACKBLAZE_KEY_ID,
  applicationKey: process.env.BACKBLAZE_APP_KEY
});

const supabase = new SupabaseClient(process.env.SUPABASE_URL, process.env.SUPABASE_ADMIN_KEY);

export default defineEventHandler(async (event) => {
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
  await supabase.from('Backups').insert({
    key: body?.name,
    backup_id: backupId
  });

  const uploadId = await backblaze.getUploadUrl({
    bucketId: process.env.BACKBLAZE_BUCKET_ID
  });

  const file = Buffer.from(body.data, 'base64');

  await backblaze.uploadFile({
    uploadUrl: uploadId.data.uploadUrl,
    uploadAuthToken: uploadId.data.authorizationToken,
    data: file,
    fileName: `${body.name}/${backupId}`
  });

  return {
    id: backupId
  };
});
