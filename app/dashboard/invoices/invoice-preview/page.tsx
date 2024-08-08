'use client';

import React from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

interface InvoiceData {
  [key: string]: any;
}

const InvoicePreview: React.FC = () => {
  const searchParams = useSearchParams();
  const data = searchParams.get('data');

  let invoiceData: InvoiceData;
  try {
    invoiceData = data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Hiba történt az adatok feldolgozása során:', error);
    invoiceData = {};
  }

  const handlePrint = () => {
    window.print();
  };

  const safeValue = (key: string) => {
    return invoiceData[key] || '';
  };

  return (
    <div className="relative mt-16">
      <button onClick={handlePrint} className="absolute top-[-4rem] right-0 bg-[#2487AF] text-white px-4 py-2 rounded">
        Nyomtatás
      </button>
      <div className="w-[790px] min-h-[1120px] mx-auto bg-white shadow-lg overflow-hidden flex flex-col">
        <div className="px-[40px] py-[60px] flex-grow">
          {/* 1. sor */}
          <div className="border-b border-black pb-2 flex items-center">
            <span className="text-xs mr-2">1.sor</span>
            <Image src="/Westech_invoice_logo.png" alt="WESTech Logo" width={100} height={28} />
          </div>

          {/* 2-4. sor */}
          <div className="text-[13px] mt-2">
            <p><span className="text-xs mr-2">2.sor</span>{safeValue('f04')}</p>
            <p><span className="text-xs mr-2">3.sor</span>{safeValue('f06')}</p>
            <p><span className="text-xs mr-2">4.sor</span>{safeValue('f07')} {safeValue('f05')}</p>
          </div>

          {/* 5. sor */}
          <div className="flex justify-between mt-[83px]">
            <div className="text-[#2487AF] text-[24px] font-semibold">
              <span className="text-xs mr-2">5.sor</span>Számla
            </div>
            <div className="text-right text-[#2487AF] text-[24px] font-semibold">
              <span className="text-red-500">{safeValue('f01')}/{safeValue('f02')}/{safeValue('f03')}</span>
            </div>
          </div>

          {/* 6. sor */}
          <div className="text-right text-[14px] uppercase mt-[25px] font-semibold">
            <span className="text-xs mr-2">6.sor</span>SZÁMLA SORSZÁM
          </div>

          {/* 7-13. sor */}
          <div className="grid grid-cols-2 gap-8 mt-[20px]">
            <div>
              <h2 className="font-semibold text-[16px]"><span className="text-xs mr-2">7.sor</span>KIBOCSÁTÓ</h2>
              <p className="font-bold mt-[20px] text-[18px] text-red-500"><span className="text-xs mr-2">8.sor</span>{safeValue('f04')}</p>
              <div className="mt-[20px] text-[18px]">
                <p className="text-red-500"><span className="text-xs mr-2">9.sor</span>{safeValue('f06')}</p>
                <p className="text-red-500"><span className="text-xs mr-2">10.sor</span>{safeValue('f07')} {safeValue('f08')}</p>
              </div>
              <div className="mt-[20px] text-[18px]">
                <p><span className="text-xs mr-2">11.sor</span>Adószám: <span className="text-red-500">{safeValue('f09')}</span></p>
                <p><span className="text-xs mr-2">12.sor</span>Bankszámla: <span className="text-red-500">{safeValue('f10')}</span></p>
                <p className="text-red-500"><span className="text-xs mr-2">13.sor</span>{safeValue('f11')}</p>
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-[16px]">VEVŐ</h2>
              <p className="font-bold mt-[20px] text-[18px] text-red-500">{safeValue('f12')}</p>
              <div className="mt-[20px] text-[18px]">
                <p className="text-red-500">{safeValue('f14')}</p>
                <p className="text-red-500">{safeValue('f15')} {safeValue('f16')}</p>
              </div>
              <p className="mt-[20px] text-[18px]">Adószám: <span className="text-red-500">{safeValue('f17')}</span></p>
              <p className="text-[18px]">Közösségi adószám: <span className="text-red-500">{safeValue('f18')}</span></p>
            </div>
          </div>

          {/* 14-17. sor */}
          <div className="mt-[20px] text-[18px]">
            <span className="text-xs mr-2">14.sor</span>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="text-left">SZÁMLA KELTE:</td>
                  <td className="text-right text-red-500">{safeValue('f22')}</td>
                </tr>
                <tr>
                  <td className="text-left">TELJESÍTÉS DÁTUMA:</td>
                  <td className="text-right text-red-500">{safeValue('f23')}</td>
                </tr>
                <tr>
                  <td className="text-left">FIZETÉSI FELTÉTEL:</td>
                  <td className="text-right text-red-500">{safeValue('f24')}</td>
                </tr>
                <tr>
                  <td className="text-left">FIZETÉSI HATÁRIDŐ:</td>
                  <td className="text-right font-bold text-red-500">{safeValue('f25')}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* 18. sor - Tételek táblázat */}
          <div className="mt-[40px]">
            <span className="text-xs mr-2">18.sor</span>
            <table className="w-full">
              <thead className="bg-gray-200 h-[50px]">
                <tr className="text-[13px] font-semibold text-gray-600">
                  <th className="text-left px-3">Leírás</th>
                  <th className="text-right p-2">Mennyiség</th>
                  <th className="text-right p-2">Egységár</th>
                  <th className="text-right p-2">Nettó ár</th>
                  <th className="text-right p-2">Adó</th>
                  <th className="text-center p-2">
                    <div>Adó</div>
                    <div>összege</div>
                  </th>
                  <th className="text-right px-3">Bruttó ár</th>
                </tr>
              </thead>
              <tbody>
                {/* Itt kellene megjeleníteni a tételeket */}
              </tbody>
            </table>
          </div>

          {/* 19. sor - Összegek táblázat */}
          <div className="flex justify-end mt-[30px]">
            <span className="text-xs mr-2">19.sor</span>
            <table className="w-[220px] text-[14px]">
              <tbody>
                <tr className="h-[30px] border-t border-black">
                  <td className="font-bold">Nettó összeg:</td>
                  <td className="text-right text-red-500">{safeValue('f36')} Ft</td>
                </tr>
                <tr className="h-[30px]">
                  <td className="font-bold">Összesen:</td>
                  <td className="text-right text-red-500">{safeValue('f37')} Ft</td>
                </tr>
                <tr className="h-[30px] border-t border-black">
                  <td className="font-bold">FIZETENDŐ ÖSSZEG:</td>
                  <td className="text-right font-bold text-red-500">{safeValue('f38')} Ft</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 20. sor - Adó táblázat */}
          <div className="mt-[30px]">
            <span className="text-xs mr-2">20.sor</span>
            <table className="w-[345px] text-[14px]">
              <thead className="bg-gray-200 h-[30px]">
                <tr>
                  <th className="text-left p-2">Adó</th>
                  <th className="text-right p-2">Adó alapja</th>
                  <th className="text-right p-2">Összeg</th>
                </tr>
              </thead>
              <tbody>
                <tr className="h-[30px]">
                  <td className="text-red-500">27%</td>
                  <td className="text-right text-red-500">{safeValue('f36')} Ft</td>
                  <td className="text-right text-red-500">{safeValue('f40')} Ft</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 21. sor - Megjegyzések */}
          <div className="mt-[15px] text-[14px] font-semibold">
            <span className="text-xs mr-2">21.sor</span>
            <p>Megjegyzések: <span className="text-red-500">{safeValue('f41')}</span></p>
          </div>
        </div>

        {/* 22. sor - Lábléc */}
        <footer className="px-[40px] py-2 text-[15px] border-t border-black">
          <span className="text-xs mr-2">22.sor</span>
          <div className="flex justify-between font-bold">
            <span className="text-[#2487AF]">{safeValue('f42')}</span>
            <span className="text-[#2487AF]">{safeValue('f43')}</span>
            <span className="text-black">{safeValue('f44')}</span>
          </div>
        </footer>

        {/* 23. sor - Oldalszám */}
        <div className="px-[40px] py-2 text-gray-500 text-[14px] text-right">
          <span className="text-xs mr-2">23.sor</span>
          Oldal: <span className="text-red-500">{safeValue('f45')}</span>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;