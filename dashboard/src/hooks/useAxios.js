import { useState, useEffect } from "react";
import axios from "axios";


const useAxios = url => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const axiosData = async () => {
            setLoading(true);
            try {
                // const res = await fetch(url);
                const axiosInstance = axios.create({
                    withCredentials: true
                })
                // console.log("URL is: ", url);

                const res = await axios.get(`${url}`);

                // console.log(res.data);
                if (res.status !== 200) {
                    setError("failed to get axios from frontend");
                }
                const result = await res.data.data;
                console.log("Result:", result);

                setData(result);
                // setData(result.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        axiosData();
    }, [url]);

    return {
        data,
        error,
        loading,
    };
};

export default useAxios;
