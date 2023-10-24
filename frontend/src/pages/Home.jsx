import React from 'react';
import QLDiem from "../asset/images/ql_diem.gif"

const Home = () => {
  return (
    <>
      <section className="px-5 xl:px-0 container">
        <div className="max-w-[1170px] mx-auto bg-slate-300 rounded">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* =============image box============= */}
            <div className="bg-primaryColor rounded-l-lg lg:pl-16 p-10 items-center">
              <div>
                <h1 className="infor justify-center mb-3">Thông tin Sinh Viên</h1>

              </div>
            </div>

            {/* =============login form============= */}
            <div className="rounded-l-lg  p-10">
              <div className="gap-8 columns-1 ">
                <img className="w-full aspect-video" src={QLDiem} />
                <img className="w-full aspect-square" src="..." />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
