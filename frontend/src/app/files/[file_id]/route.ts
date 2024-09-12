import fs from 'fs';
import { stat } from 'fs/promises';
import { NextRequest } from 'next/server';
import { basename } from 'path';
export async function GET(request: NextRequest, context: { params: { file_id: string } }) {
  // check if ./files directory exists
  // else return 404
  const { file_id } = context.params;


  const path = `./files/${file_id}`;
  const stats = await stat(path)
  // check if file exists
  if (!fs.existsSync(path)) {
    return Response.json({ body: 'File not found' }, { status: 404 });
  }
  const webPlatformStream = streamFile(path)
  return new Response(webPlatformStream, {
    status: 200,
    headers: new Headers({
      "content-disposition":
        `attachment; filename=${basename(
          path
        )}`,
      "content-type": "application/zip",
      "content-length": stats.size + "",
    }
    )
  });
}


async function* nodeStreamToIterator(stream: fs.ReadStream) {
  for await (const chunk of stream) {
    yield new Uint8Array(chunk);
  }
}
function iteratorToStream(iterator: AsyncGenerator<Uint8Array>): ReadableStream {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}
function streamFile(path: string): ReadableStream {
  const nodeStream = fs.createReadStream(path);
  const data: ReadableStream = iteratorToStream(
    nodeStreamToIterator(
      nodeStream
    )
  )
  return data
}