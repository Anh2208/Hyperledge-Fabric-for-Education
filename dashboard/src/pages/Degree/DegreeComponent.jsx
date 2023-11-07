import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../utils/config';
import axios from 'axios';
import { Link } from 'react-router-dom'
import Manager from "../../asset/images/open-book.png"
import Create from "../../asset/images/bachelor.png"
import Search from "../../asset/images/research.png"


const DegreeComponent = () => {
  const [infor, setInfor] = useState('');

  const fetchData = async () => {
    try {
      const axiosInstance = axios.create({
        withCredentials: true,
      });
      const response = await axiosInstance.get(`${BASE_URL}degree/nft/getInfor`);
      setInfor(response.data.data);
    } catch (err) {
      console.log("erro is", err);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);
  console.log("infor sss", infor);

  const cardLinks = [
    {
      name: "Tạo bằng cấp",
      href: "/degree/create",
      image: Create,
    },
    {
      name: "Tra cứu bằng cấp",
      href: "/degree/result",
      image: Search,
    },
    {
      name: "Cập nhật bằng cấp",
      href: "/degree/update",
      image: Manager,
    },
  ];



  return (
    <>
      <section className='content-main'>
        <div className="content-header flex mb-10">
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-10 p-5 rounded-lg justify-between w-full text-center px-10'>
            <div className='box-infor-left rounded-md  border border-slate-400'>
              <h1>Bằng cấp</h1>
              <h1 className=' text-[20px]'>{infor.TotalSupply}</h1>
            </div>
            <div className='box-infor-mid rounded-md  border border-slate-400'>
              <h1>Tên NFT</h1>
              <h1 className=' text-[20px]'>{infor.Name}</h1>
            </div>
            <div className='box-infor-right  rounded-md  border border-slate-400'>
              <h1>Ký hiệu NFT</h1>
              <h1 className=' text-[20px]'>{infor.Symbol}</h1>
            </div>
          </div>
        </div>
        <div className=" flex justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 p-5 border-2 border-black rounded-lg justify-center">
            {cardLinks.map((item, index) => {
              return (
                <div className="rounded overflow-hidden shadow-lg card-item" key={index}>
                  <Link to={item.href} ><img src={item.image} alt="" className='p-10' /></Link>
                  <div className="px-6 py-4  card-home">
                    {/* <button className="font-bold text-xl mb-2 text-center">Quản lý điểm</button> */}
                    <Link to={item.href} className="font-bold text-xl mb-2 text-[1rem]" >{item.name}</Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div >
      </section >
    </>
  )
}

export default DegreeComponent