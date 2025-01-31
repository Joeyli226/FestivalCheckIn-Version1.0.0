import { google } from 'googleapis';
import { useRouter } from 'next/router';
import Nav from './layout';

export async function getServerSideProps(context: any) {
  const auth = await google.auth.getClient({
    credentials: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/gm, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const sheet_row = String(Number(context.query.info) + 2);

  // Update check-in status at column I
  const request_body_I = {
    "range": "J" + sheet_row,
    "values": [
      [true]
    ]
  };

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SHEET_ID,
    range: "J" + sheet_row, // Check-in is now at column I
    valueInputOption: "USER_ENTERED",
    requestBody: request_body_I,
  });

  const range = 'A2:J500'; // Include columns A through J
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range,
  });

  const data = response.data.values;
  return {
    props: {
      data,
    },
  };
}

function pad(n: string, length: number) {
  var len = length - ('' + n).length;
  return (len > 0 ? new Array(++len).join('0') : '') + n;
}

export default function Details({ data }: any) {
  const router = useRouter();
  const row = Number(router.query.info);
  const Fname = data[row][3];
  const lottery_id = data[row][9] ? pad(data[row][9], 3) : ''; // Lottery number is now at column J (index 9)

  const d0 = lottery_id.charAt(0);
  const d1 = lottery_id.charAt(1);
  const d2 = lottery_id.charAt(2);

  return (
    <div className='bg-MidAutumnBg h-screen flex flex-col items-center justify-center'>
      <Nav></Nav>
      <div style={{ height: '123px' }}></div>
      <div style={{ height: '123px' }}></div>
      
      <div className="absolute inset-0 z-10"></div>
      <iframe src="https://giphy.com/embed/iehOstHSrp1XUYvXFZ" width="100%" height="219" className="giphy-embed absolute top-10 w-full" allowFullScreen></iframe>
      <h1 className="text-center text-3xl font-medium text-orange-600 mt-12 pt-0">您好 {Fname},</h1>
      <h1 className="text-center text-2xl font-medium text-orange-600 mt-1 pb-2">Welcome, {Fname}</h1>
      {lottery_id ?
        (<div>
          <h2 className="text-center text-2xl font-medium text-orange-600 mt-1">您的抽奖号码是：</h2>
          <h2 className="text-center text-xl font-medium text-orange-600 pb-3">Your lottery number is: </h2>
          <div className="flex gap-3 justify-center">
            <div className="font-mono text-9xl bg-slate-200 shadow-inner rounded p-2 text-center opacity-60">{d0}</div>
            <div className="font-mono text-9xl bg-slate-200 shadow-inner rounded p-2 text-center opacity-60">{d1}</div>
            <div className="font-mono text-9xl bg-slate-200 shadow-inner rounded p-2 text-center opacity-60">{d2}</div>
          </div>
        </div>)
        : (<div>
          <h2 className="text-center text-2xl font-medium text-orange-600 mt-4">暂时没有抽奖号哦～请在主持人提示后刷新本页面</h2>
          <h2 className="text-center text-xl font-medium text-orange-600 pb-3">No lottery number available currently... Please refresh after host announcement. </h2>
        </div>)
      }
    </div>
  );
}
