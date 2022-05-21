import { SupabaseClient } from '@supabase/supabase-js';
import Backblaze from 'backblaze-b2';
import filenamify from 'filenamify';

const backblaze = new Backblaze({
  applicationKeyId: process.env.BACKBLAZE_KEY_ID,
  applicationKey: process.env.BACKBLAZE_APP_KEY
});

const supabase = new SupabaseClient(process.env.SUPABASE_URL, process.env.SUPABASE_ADMIN_KEY);

export default defineEventHandler(async (event) => {
  await backblaze.authorize();
  const body: {
    name?: string;
  } = await useBody(event);

  if (typeof body?.name !== 'string') {
    event.res.statusCode = 400;
    return {
      error: 'Invalid data'
    };
  }

  // We keep track of the backups in Supabase and store the actual backups in Backblaze
  const { data, error } = await supabase.from('Backups').select('backup_id').eq('backup_id', body.name).order('created_at', { ascending: false });
  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    event.res.statusCode = 500;
    return {
      error: 'Internal server error'
    };
  }

  if (!data[0]) {
    event.res.statusCode = 404;
    return {
      error: 'Not found'
    };
  }

  const download = await backblaze.downloadFileByName({
    bucketName: process.env.BACKBLAZE_BUCKET_ID,
    fileName: `${filenamify(body.name)}/${data[0].backup_id}`,
    responseType: 'arraybuffer'
  });

  const file = Buffer.from(download.data, 'base64');

  return {
    data: file.toString('base64')
  };
});
