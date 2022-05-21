import { SupabaseClient } from '@supabase/supabase-js';

const supabase = new SupabaseClient(process.env.SUPABASE_URL, process.env.SUPABASE_ADMIN_KEY);

export default defineEventHandler(async (event) => {
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
  const { data, error } = await supabase.from('Backups').select('backup_id').eq('key', body.name).order('created_at', { ascending: false });
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

  return {
    data: data[0].backup_id
  };
});
