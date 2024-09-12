import fs from 'fs';
import { NextRequest } from 'next/server';
export async function GET(request: NextRequest,context:{params:{file_id:string}}) {
  // check if ./files directory exists
  // else return 404
  const { file_id } = context.params;


  // check if file exists
  if (!fs.existsSync(`./files/${file_id}`)) {
    return Response.json({ body: 'File not found' }, { status: 404 });
  }
  const webPlatformStream = streamFile(`./files/${file_id}`)
  return new Response(webPlatformStream)
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