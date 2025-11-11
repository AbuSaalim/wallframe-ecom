import axios from "axios";
import { useState, useEffect, useMemo } from "react";

const useFetch = (url, method = "GET", options = {}) => {
  const [data, setData] = useState(null);
  const [loading , setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const optionString = JSON.stringify(options);

  const requestOptions = useMemo(() => {
    const otps = { ...options };
    if (method === 'POST' && !otps.data) {
      otps.data = {};
    }
    return otps;
  }, [method, optionString]);

  useEffect(() => {
    const apiCall = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: response } = await axios({
          url,
          method,
          ...requestOptions
        });

        if (!response.success) {
          throw new Error(response.message);
        }

        setData(response);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    apiCall();
  }, [url, requestOptions, refreshIndex]);

  const refetch = () => setRefreshIndex(i => i + 1);

  return { data, loading, error, refetch };
};

export default useFetch;
