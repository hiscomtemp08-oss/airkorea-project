import express from "express";
import dotenv from "dotenv";
import { XMLParser } from "fast-xml-parser";

dotenv.config();

const app = express();

const PORT =
  process.env.PORT || 3000;

const SERVICE_KEY =
  process.env.AIRKOREA_SERVICE_KEY;


// 현재 폴더의 index.html 제공
app.use(
  express.static(".")
);


function normalizeKey(key) {

  if (!key) return "";

  try {

    return decodeURIComponent(
      key.trim()
    );

  } catch {

    return key.trim();

  }

}


app.get(
  "/api/air",

  async (req, res) => {


    const stationName =
      String(
        req.query.stationName || ""
      ).trim();


    if (!SERVICE_KEY) {

      return res.status(500).json({

        success: false,

        error:
          "API 인증키가 설정되지 않았습니다."

      });

    }


    if (!stationName) {

      return res.status(400).json({

        success: false,

        error:
          "측정소 이름을 입력해주세요."

      });

    }


    const params =
      new URLSearchParams();


    params.append(
      "serviceKey",
      normalizeKey(SERVICE_KEY)
    );

    params.append(
      "returnType",
      "json"
    );

    params.append(
      "numOfRows",
      "1"
    );

    params.append(
      "pageNo",
      "1"
    );

    params.append(
      "stationName",
      stationName
    );

    params.append(
      "dataTerm",
      "DAILY"
    );

    params.append(
      "ver",
      "1.5"
    );


    const apiURL =

      "https://apis.data.go.kr/" +

      "B552584/" +

      "ArpltnInforInqireSvc/" +

      "getMsrstnAcctoRltmMesureDnsty?" +

      params.toString();


    try {


      const response =
        await fetch(apiURL);


      const rawText =
        await response.text();


      // JSON 먼저 시도

      let data;


      try {

        data =
          JSON.parse(rawText);

      }


      // JSON이 아니면 XML 처리

      catch {


        const parser =
          new XMLParser();


        const xml =
          parser.parse(rawText);


        const header =
          xml?.response?.header;


        const body =
          xml?.response?.body;


        if (
          header &&
          String(
            header.resultCode
          ) !== "00"
        ) {

          return res.status(502).json({

            success: false,

            error:

              header.resultMsg ||

              "AirKorea API 오류"

          });

        }


        let items =
          body?.items?.item;


        if (
          !Array.isArray(items)
        ) {

          items =
            items ? [items] : [];

        }


        if (!items[0]) {

          return res.status(404).json({

            success: false,

            error:

              "측정 데이터를 찾지 못했습니다."

          });

        }


        return res.json({

          success: true,

          ...items[0]

        });

      }


      // JSON API 오류

      const header =
        data?.response?.header;


      if (

        header &&

        String(
          header.resultCode
        ) !== "00"

      ) {

        return res.status(502).json({

          success: false,

          error:

            header.resultMsg ||

            "AirKorea API 오류"

        });

      }


      const items =
        data?.response
          ?.body
          ?.items;


      if (
        !items ||
        items.length === 0
      ) {

        return res.status(404).json({

          success: false,

          error:

            "측정 데이터를 찾지 못했습니다."

        });

      }


      return res.json({

        success: true,

        ...items[0]

      });


    } catch (error) {


      console.error(error);


      return res.status(500).json({

        success: false,

        error:

          "API 연결 중 오류가 발생했습니다.",

        detail:
          error.message

      });

    }

  }

);


app.listen(
  PORT,

  () => {

    console.log(

      `웹사이트 실행: http://localhost:${PORT}`

    );

  }
);
