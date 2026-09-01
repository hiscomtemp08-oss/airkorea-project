import { XMLParser } from "fast-xml-parser";

export default async function handler(req, res) {

  const { stationName } = req.query;


  if (!stationName) {

    return res.status(400).json({
      error: "측정소 이름이 없습니다."
    });

  }


  const serviceKey =
    process.env.AIRKOREA_SERVICE_KEY;


  if (!serviceKey) {

    return res.status(500).json({
      error: "AirKorea API 키가 설정되지 않았습니다."
    });

  }


  try {

    const params =
      new URLSearchParams({

        serviceKey: serviceKey,

        returnType: "json",

        numOfRows: "1",

        pageNo: "1",

        stationName: stationName,

        dataTerm: "DAILY",

        ver: "1.5"

      });


    const url =
      "https://apis.data.go.kr/" +
      "B552584/" +
      "ArpltnInforInqireSvc/" +
      "getMsrstnAcctoRltmMesureDnsty?" +
      params.toString();


    const response =
      await fetch(url);


    const text =
      await response.text();


    let result;


    // JSON 응답 처리

    try {

      result =
        JSON.parse(text);

    }


    // XML 응답 처리

    catch {

      const parser =
        new XMLParser();

      result =
        parser.parse(text);

    }


    // JSON 구조

    let items =
      result?.response
        ?.body
        ?.items;


    // XML 구조

    if (!items) {

      items =
        result?.response
          ?.body
          ?.items
          ?.item;

    }


    if (
      !items ||
      items.length === 0
    ) {

      const errorMessage =
        result?.response
          ?.header
          ?.resultMsg;

      return res.status(404).json({

        error:
          errorMessage ||
          "측정 데이터를 찾지 못했습니다."

      });

    }


    // 첫 번째 데이터

    const item =
      Array.isArray(items)
        ? items[0]
        : items;


    return res.status(200).json(item);


  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:
        "AirKorea API 연결 실패: " +
        error.message

    });

  }

}
