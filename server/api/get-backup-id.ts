import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'POST') {
    event.res.statusCode = 405;
    event.res.setHeader('Allow', 'POST');
    return {};
  }
  const supabase = serverSupabaseServiceRole(event);
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
  const { data, error } = await supabase.from('Backups').select('backup_id').eq('key', body.name).order('created_at', { ascending: false }).limit(1).single();
  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    event.res.statusCode = 500;
    return {
      error: 'Internal server error'
    };
  }

  if (!data) {
    event.res.statusCode = 404;
    return {
      error: 'Not found'
    };
  }

  return {
    data: data.backup_id
  };
});
