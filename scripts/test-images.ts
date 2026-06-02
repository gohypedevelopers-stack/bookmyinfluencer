import http from 'https';

const URLs = [
  'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618018352910-334ff9945763?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620122303020-43ec4b6cf7f8?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1602442787305-decbd65be507?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1612958771753-473216cb82d7?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1614089017253-44778be28f24?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1604904612715-47eb97e19993?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1609196253479-bc3de1241555?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1629872430082-93d8912beccf?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1617462180479-d2d0c273a0c5?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1615813967233-eb04ec282035?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1613679074971-91fc27180061?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1611042553975-08733608b2db?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1630208232589-e42b1046876c?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1626548307930-deac221f87d9?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1624298357597-fd92dfbec01d?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1619380061814-58f03707f082?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1622080858973-e300409f1b13?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1610216705422-caa3fcb6d158?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1605380862212-075a7a9a8385?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1625897428517-7e2062829a26?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1629124483786-fbdfa151525a?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1626885208406-5b158e2a24b0?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1613915611413-5a022f4ee8ca?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1602233158242-3ba0ac4d2167?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1619603364937-8412cb957fa2?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1617942704257-ad6d7e008f51?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1632766339301-40b45cb9b013?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1604004555489-723a93d6ce74?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1596215143922-eedeaba0d91c?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608976328321-ea74f884102c?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1605980776566-0486c3ac7617?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1626290074127-147de952ff75?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1609100416954-4770ceae9fa4?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1586790170941-8f92507d200d?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620332372374-f1a86bc16f87?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1614644147724-2d4785d69962?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1605369572399-05d8d64a0f6e?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618679078335-ca4b341f4c7d?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1619179834700-1c5c82e6d6c9?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1628033033527-2c938de1f744?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1609010697446-4a7b7c0bd6ec?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1622281541400-580795c6544a?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1611432579699-484f7990b127?w=500&auto=format&fit=crop&q=80'
];

async function checkUrl(url: string): Promise<number> {
  return new Promise((resolve) => {
    const req = http.request(url, { method: 'HEAD' }, (res) => {
      resolve(res.statusCode || 0);
    });
    req.on('error', () => resolve(0));
    req.end();
  });
}

async function main() {
  console.log("Checking Unsplash URLs...");
  for (const url of URLs) {
    const status = await checkUrl(url);
    if (status !== 200) {
      console.log(`❌ BROKEN: ${url} (Status: ${status})`);
    } else {
      console.log(`✅ OK: ${url}`);
    }
  }
}

main();
