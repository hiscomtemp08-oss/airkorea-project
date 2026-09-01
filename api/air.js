export default async function handler(req, res) {
  const stationName = req.query.stationName;

  if (!stationName) {
    return res.status(400).json({
      error: "측정소 이름을 입력해주세요."
    });
  }

  const serviceKey = process.env.AIRKOREA_SERVICE_KEY;

  if (!serviceKey) {
    return res.status(500).json({
      error: "API 인증키가 설정되지 않았습니다."
    });
  }

  try {
    /*
      서비스키가 이미 URL 인코딩된 상태일 수 있으므로
      URLSearchParams를 사용하지 않고 직접 URL을 만듭니다.
    */

    const url =
      "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty" +
      "?serviceKey=" + serviceKey +
      "&returnType=json" +
      "&numOfRows=1" +
      "&pageNo=1" +
      "&stationName=" + encodeURIComponent(stationName) +
      "&dataTerm=DAILY" +
      "&ver=1.5";

    console.log("API 요청 중...");

    const response = await fetch(url);

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
