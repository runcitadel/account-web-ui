import Backblaze from 'backblaze-b2';
import filenamify from 'filenamify';

const backblaze = new Backblaze({
  applicationKeyId: process.env.BACKBLAZE_KEY_ID,
  applicationKey: process.env.BACKBLAZE_APP_KEY
});

export default defineEventHandler(async (event) => {
  await backblaze.authorize();
  const body: {
    name?: string;
    id?: string;
  } = await useBody(event);

  if (typeof body?.name !== 'string' || typeof body?.id !== 'string') {
    event.res.statusCode = 400;
    return {
      error: 'Invalid data'
    };
  }

  const download = await backblaze.downloadFileByName({
    bucketName: process.env.BACKBLAZE_BUCKET_ID,
    fileName: `${filenamify(body.name)}/${filenamify(body.id)}`,
    responseType: 'arraybuffer'
  });

  const file = Buffer.from(download.data);

  return {
    data: file.toString('base64')
  };
});
