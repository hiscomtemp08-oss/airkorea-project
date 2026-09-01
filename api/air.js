export default async function handler(
  req,
  res
) {


  const serviceKey =
    process.env.POHANG_API_KEY;



  if (!serviceKey) {

    return res.status(500).json({

      error:
        "포항시 API 인증키가 설정되지 않았습니다."

    });

  }



  try {


    /*
      포항시 대기오염 환경 API

      Base URL:
      https://apis.data.go.kr/5020000/pohangArpltnEnvrn

      상세 기능 경로는 공공데이터포털의
      API 상세기능명을 기준으로 사용합니다.
    */


    const baseUrl =
      "https://apis.data.go.kr/5020000/pohangArpltnEnvrn";


    const apiUrl =
      baseUrl +
      "/getPohangArpltnEnvrn" +
      "?serviceKey=" +
      serviceKey +
      "&pageNo=1" +
      "&numOfRows=10" +
      "&type=json";


    const response =
      await fetch(apiUrl);


    const text =
      await response.text();



    // JSON인지 먼저 확인

    let data;


    try {

      data =
        JSON.parse(text);

    }


    catch {

      return res.status(500).json({

        error:
          "포항시 API가 JSON 데이터를 반환하지 않았습니다.",

        detail:
          text.substring(0, 500)

      });

    }



    /*
      공공데이터포털 API 응답 구조는
      데이터마다 조금씩 다를 수 있으므로
      여러 구조를 확인
    */


    const body =
      data.response?.body ||
      data.body ||
      data;



    const items =
      body.items?.item ||
      body.items ||
      body.item ||
      [];



    const item =
      Array.isArray(items)
        ? items[0]
        : items;



    if (
      !item
    ) {

      return res.status(404).json({

        error:
          "포항시 대기오염 데이터를 찾지 못했습니다.",

        apiResponse:
          data

      });

    }



    return res.status(200).json({

      item: item,

      rawData: data

    });


  }


  catch (error) {


    console.error(
      "포항시 API 오류:",
      error
    );


    return res.status(500).json({

      error:
        "포항시 대기오염 API 연결에 실패했습니다.",

      detail:
        error.message

    });


  }


}
    const data = await response.json();

    console.log(data);

    if (
      data.response?.header?.resultCode !== "00"
    ) {
      return res.status(400).json({
        error:
          data.response?.header?.resultMsg ||
          "API 요청에 실패했습니다."
      });
    }

    const items =
      data.response?.body?.items;

    if (!items || items.length === 0) {
      return res.status(404).json({
        error: "해당 측정소의 데이터를 찾을 수 없습니다."
      });
    }

    return res.status(200).json(
      items[0]
    );

  } catch (error) {

    console.error("API 오류:", error);

    return res.status(500).json({
      error: error.message
    });

  }
}
