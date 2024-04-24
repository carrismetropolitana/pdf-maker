PDF generator for schedules within Carris Metropolitana.

We use Puppeteer to render pages from Next.js into a PDF.

Next.js consumes data from the CarrisMetropolitana API.

To run the project fully locally, run the following command at the root of the project:
```bash
docker-compose -f docker-compose.local.yml up
```

To develop the project, run the following command in the "renderer" directory:
```bash
npm i
npm run dev
```
You should have timetables available at http://localhost:3000/{line_id}/{direction_id}/{stop_id}

If you want to generate the pdfs yourself, you can run the following command in the "printer" directory:
```bash
npm i
npm run start-all
```
The pdfs will be available in the "printer/pdfs" directory.