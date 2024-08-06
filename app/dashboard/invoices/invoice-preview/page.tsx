'use client';

import React from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

const InvoicePreview: React.FC = () => {
  const searchParams = useSearchParams();
  const data = searchParams.get('data');

  let invoiceData;
  try {
    invoiceData = data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Hiba történt az adatok feldolgozása során:', error);
    invoiceData = null;
  }

  if (!invoiceData) {
    return <div>Hiba történt a számla adatok betöltésekor.</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative mt-16">
      <button onClick={handlePrint} className="absolute top-[-4rem] right-0 bg-[#2487AF] text-white px-4 py-2 rounded">
        Nyomtatás
      </button>
      <div className="w-[790px] min-h-[1120px] mx-auto bg-white shadow-lg overflow-hidden flex flex-col">
        <div className="px-[40px] py-[60px] flex-grow">
          <div className="border-b border-black pb-2">
            <Image src="/Westech_invoice_logo.png" alt="WESTech Logo" width={100} height={28} />
          </div>

          <div className="text-[13px]">
            <p>WESTech HU Kft.</p>
            <p>Váci út 91. IV. emelet</p>
            <p>1139 Budapest</p>
            <p>Magyarország</p>
          </div>

          <div className="flex justify-between mt-[83px]">
            <div className="text-[#2487AF] text-[24px] font-semibold">Számla</div>
            <div className="text-right text-[#2487AF] text-[24px] font-semibold">{invoiceData.szamla_szam.szla_prefix}/{invoiceData.szamla_szam.szla_year}/{invoiceData.szamla_szam.ODU_szamlaszam}</div>
          </div>

          <div className="text-right text-[14px] uppercase mt-[25px] font-semibold ">SZÁMLA SORSZÁM</div>

          <div className="grid grid-cols-2 gap-8 mt-[20px]">
            <div>
              <h2 className="font-semibold text-[16px] ">KIBOCSÁTÓ</h2>
              <p className="font-bold mt-[20px] text-[18px]">{invoiceData.kibocsato.cegnev}</p>
              <div className="mt-[20px] text-[18px]">
                <p>{invoiceData.kibocsato.cim.telepules}</p>
                <p>{invoiceData.kibocsato.cim.utca_hsz}</p>
                <p>{invoiceData.kibocsato.cim.iranyitoszam} {invoiceData.kibocsato.cim.orszag}</p>
              </div>
              <div className="mt-[20px] text-[18px]">
                <p>Adószám: {invoiceData.kibocsato.adoszam}</p>
                <p>Bankszámla: {invoiceData.kibocsato.bankszamla.szamlaszam} ({invoiceData.kibocsato.bankszamla.bank})</p>
              </div>
              <p className="mt-[20px] font-bold text-[18px]">Forrás:</p>
              <p className="mt-[4px] text-[18px] ">{invoiceData.kibocsato.ODU_rendeles_szam} {invoiceData.kibocsato.I6_rendeles_szam}</p>
              <p className="mt-[20px] font-bold text-[18px]">Referencia:</p>
              <p className="mt-[4px] text-[18px] ">{invoiceData.kibocsato.I6_szamlaszam}</p>
            </div>
            <div>
              <h2 className="font-semibold text-[16px]">VEVŐ</h2>
              <p className="font-bold mt-[20px] text-[18px]">{invoiceData.vevo.cegnev}</p>
              <div className="mt-[20px] text-[18px]">
                <p>{invoiceData.vevo.cim.telepules}</p>
                <p>{invoiceData.vevo.cim.utca_hsz}</p>
                <p>{invoiceData.vevo.cim.iranyitoszam} {invoiceData.vevo.cim.orszag}</p>
              </div>
              <p className="mt-[20px] text-[18px]">Adószám: {invoiceData.vevo.adoszam}</p>
              <p className="text-[18px]">Közösségi adószám: {invoiceData.vevo.kozossegi_adoszam}</p>
              <div className="mt-[20px] text-[18px]">
                {/* Módosított rész: a dátumokat tartalmazó táblázat */}
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="text-left">SZÁMLA KELTE:</td>
                      <td className="text-right">{invoiceData.datumok.szamla_kelte}</td>
                    </tr>
                    <tr>
                      <td className="text-left">TELJESÍTÉS DÁTUMA:</td>
                      <td className="text-right">{invoiceData.datumok.teljesites_datuma}</td>
                    </tr>
                    <tr>
                      <td className="text-left">FIZETÉSI FELTÉTEL:</td>
                      <td className="text-right">{invoiceData.datumok.fizetesi_feltetel}</td>
                    </tr>
                    <tr>
                      <td className="text-left">FIZETÉSI HATÁRIDŐ:</td>
                      <td className="text-right font-bold">{invoiceData.datumok.fizetesi_hatarido}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* A kód többi része változatlan marad */}
          
          <div className="mt-[40px]">
            <table className="w-full">
              <thead className="bg-gray-200 h-[50px]">
                <tr className="text-[13px] font-semibold text-gray-600">
                  <th className="text-left px-3 w-[300px]">Leírás</th>
                  <th className="text-right p-2 w-[80px]">Mennyiség</th>
                  <th className="text-right p-2 w-[100px]">Egységár</th>
                  <th className="text-right p-2 w-[100px]">Nettó ár</th>
                  <th className="text-right p-2 w-[50px]">Adó</th>
                  <th className="text-center p-2 w-[80px]">
                    <div>Adó</div>
                    <div>összege</div>
                  </th>
                  <th className="text-right px-3 w-[100px]">Bruttó ár</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.tetel.map((item, index) => (
                  <tr key={index} className="h-[50px] text-[15px] font-semibold">
                    <td className="w-[300px]">{`{${item.I6_cikkszam}} ${item.termek_megnevezes} ${item.DJI_cikkszam} ${item.EAN}`}</td>
                    <td className="text-right w-[80px]">{item.mennyiseg}</td>
                    <td className="text-right w-[100px]">{item.egyseg_ar.toLocaleString()} Ft</td>
                    <td className="text-right w-[100px]">{item.netto_ar.toLocaleString()} Ft</td>
                    <td className="text-right w-[50px]">{item.ado.mertek}</td>
                    <td className="text-center w-[80px]">{item.ado.osszeg.toLocaleString()} Ft</td>
                    <td className="text-right w-[100px]">{item.brutto_ar.toLocaleString()} Ft</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-[30px]">
            <table className="w-[220px] text-[14px]">
              <tbody>
                <tr className="h-[30px] border-t border-black">
                  <td className="font-bold">Nettó összeg:</td>
                  <td className="text-right">{invoiceData.osszegek.netto_osszeg.toLocaleString()} Ft</td>
                </tr>
                <tr className="h-[30px] text-[#2487AF]">
                  <td className="font-bold">ÁFA összeg:</td>
                  <td className="text-right">{invoiceData.osszegek.ado_osszeg.toLocaleString()} Ft</td>
                </tr>
                <tr className="h-[30px] text-[#2487AF] border-t border-black">
                  <td className="font-bold">Bruttó összeg:</td>
                  <td className="text-right font-bold text-black">{invoiceData.osszegek.brutto_osszeg.toLocaleString()} Ft</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-[30px]">
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
                  <td>27%</td>
                  <td className="text-right">{invoiceData.osszegek.netto_osszeg.toLocaleString()} Ft</td>
                  <td className="text-right">{invoiceData.osszegek.ado_osszeg.toLocaleString()} Ft</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-[15px] text-[14px] font-semibold">
            <p>Megjegyzések: {invoiceData.szamla_megjegyezesek}</p>
          </div>
        </div>

        <footer className="px-[40px] py-2 text-[15px] border-t border-black">
          <div className="flex justify-between font-bold">
            <span className="text-[#2487AF]">{invoiceData.szamla_design.szamla_lablec.elerhetoseg.honlap}</span>
            <span className="text-[#2487AF]">{invoiceData.szamla_design.szamla_lablec.elerhetoseg.email}</span>
            <span className="text-black">{invoiceData.szamla_design.szamla_lablec.elerhetoseg.telefon}</span>
          </div>
        </footer>
        <div className="px-[40px] py-2 text-gray-500 text-[14px] text-right">
          Oldal: 1 / 1
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;