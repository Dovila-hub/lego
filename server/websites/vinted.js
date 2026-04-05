import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';

const COOKIE = "v_udt=QWMrdzhZeUdoR3FxNjhCcGhSZExIZ2RyUjNkeC0tWmRzWkR3RzNYN1orSVlXRC0tYVlsbWY5azQwZXYySE4xaUZxMmZaUT09; anonymous-locale=fr; is_shipping_fees_applied_info_banner_dismissed=false; OptanonAlertBoxClosed=2026-01-27T14:05:58.008Z; eupubconsent-v2=CQer3NgQer3NgAcABBFRCPFsAP_gAEPgAAwILNtR_G__bWlr-Tb3afpkeYxP99hr7sQxBgbJk24FzLvW7JwSx2E5NAzatqIKmRIAu3TBIQNlHJDURVCgKIgFryDMaEyUoTNKJ6BkiBMRI2JYCFxvm4pjWQCY4vr99lc1mB-N7dr82dzyy4hHn3a5_2S1UJCcIYetDfn8ZBKT-9IEd_x8v4v4_EbpE2-eS1n_pGvp4jd-YlM_dBmxt-TSffzPn_frk_e7X_vc_n3zv84XH77v_4LMgAmGhUQRlkQABAoGAECABQVhABQIAgAASBogIATBgQ5AwAXWEyAEAKAAYIAQAAgwABAAAJAAhEAFABAIAQIBAoAAwAIAgIAGBgADABYiAQAAgOgYpgQQCBYAJGZVBpgSgAJBAS2VCCQBAgrhCEWeAQQIiYKAAAEAAoAAAB4LAQkkBKxIIAuIJoAACAAAKIECBFIWYAgoDNFoKwJOAyNMAwfMEySnQZAEwQkZBkQm_CYeKQogAAAA.f_wACHwAAAAA.ILNtR_G__bXlv-Tb36fpkeYxf99hr7sQxBgbJs24FzLvW7JwS32E7NEzatqYKmRIAu3TBIQNtHJjURVChKIgVrzDsaEyUoTtKJ-BkiDMRY2JYCFxvm4pjWQCZ4vr_91d9mT-N7dr-2dzyy5hnv3a9_-S1UJicKYetHfn8ZBKT-_IU9_x-_4v4_MbpE2-eS1v_tGvt43d-4tP_dpuxt-Tyffz___f72_e7X__c__33_-_Xf_7__4A; OTAdditionalConsentString=1~43.55.61.70.83.89.93.108.117.122.124.135.143.144.147.149.159.192.196.211.228.230.239.259.266.286.291.311.320.322.323.327.367.371.385.407.415.424.430.436.445.486.491.494.495.522.523.540.550.560.568.574.576.584.587.591.737.803.820.839.864.899.904.922.938.959.979.981.985.1003.1027.1031.1046.1051.1053.1067.1092.1095.1097.1099.1107.1109.1135.1143.1149.1152.1162.1166.1186.1188.1205.1215.1226.1227.1230.1252.1268.1270.1276.1284.1290.1301.1307.1312.1329.1345.1356.1403.1415.1416.1421.1423.1440.1449.1455.1495.1512.1516.1525.1540.1548.1555.1558.1570.1577.1579.1583.1584.1603.1616.1638.1651.1653.1659.1667.1677.1678.1682.1697.1699.1703.1712.1716.1721.1725.1732.1745.1750.1765.1782.1786.1800.1810.1825.1827.1832.1838.1840.1842.1843.1845.1859.1870.1878.1880.1889.1917.1929.1942.1944.1962.1963.1964.1967.1968.1969.1978.1985.1987.2003.2027.2035.2039.2047.2052.2056.2064.2068.2072.2074.2088.2090.2103.2107.2109.2115.2124.2130.2133.2135.2137.2140.2147.2156.2166.2177.2186.2205.2213.2216.2219.2220.2222.2225.2234.2253.2275.2279.2282.2309.2312.2316.2322.2325.2328.2331.2335.2336.2343.2354.2358.2359.2370.2376.2377.2387.2400.2403.2405.2407.2411.2414.2416.2418.2425.2440.2447.2461.2465.2468.2472.2477.2484.2486.2488.2498.2510.2517.2526.2527.2532.2535.2542.2552.2563.2564.2567.2568.2569.2571.2572.2575.2577.2583.2584.2596.2604.2605.2608.2609.2610.2612.2614.2621.2627.2628.2629.2633.2636.2642.2643.2645.2646.2650.2651.2652.2656.2657.2658.2660.2661.2669.2670.2677.2681.2684.2687.2690.2695.2698.2713.2714.2729.2739.2767.2768.2770.2772.2784.2787.2791.2792.2798.2801.2805.2812.2813.2816.2817.2821.2822.2827.2830.2831.2833.2834.2838.2839.2844.2846.2849.2850.2852.2854.2860.2862.2863.2865.2867.2869.2874.2875.2876.2878.2880.2881.2882.2884.2886.2887.2888.2889.2891.2893.2894.2895.2897.2898.2900.2901.2908.2909.2916.2917.2918.2920.2922.2923.2927.2929.2930.2931.2940.2941.2947.2949.2950.2956.2958.2961.2963.2964.2965.2966.2968.2973.2975.2979.2980.2981.2983.2985.2986.2987.2994.2995.2997.2999.3000.3002.3003.3005.3008.3009.3010.3012.3016.3017.3018.3019.3028.3034.3038.3043.3052.3053.3055.3058.3059.3063.3066.3068.3070.3073.3074.3075.3076.3077.3089.3090.3093.3094.3095.3097.3099.3100.3106.3109.3112.3117.3119.3126.3127.3128.3130.3135.3136.3145.3150.3151.3154.3155.3163.3167.3172.3173.3182.3183.3184.3185.3187.3188.3189.3190.3194.3196.3209.3210.3211.3214.3215.3217.3222.3223.3225.3226.3227.3228.3230.3231.3234.3235.3236.3237.3238.3240.3244.3245.3250.3251.3253.3257.3260.3270.3272.3281.3288.3290.3292.3293.3296.3299.3300.3306.3307.3309.3314.3315.3316.3318.3324.3328.3330.3331.3531.3731.3831.4131.4531.4631.4731.4831.5231.6931.7235.7831.7931.8931.9731.10231.10631.10831.11031.11531.13632.14034.14133.14237.14332.15731.16831.16931.21233.23031.25131.25931.26031.26631.26831.27731.27831.28031.28731.28831.29631.32531.33931.34231.34631.36831.39131.39531.40632.41131.41531.43631.43731.43831.45931.46031.47232.47531.48131.49231.49332.49431.50831.52831; _lm_id=9HEX4VKS3YL552IZ; _gcl_au=1.1.1524270521.1769522758; _cc_id=eab5b53a609cbd37fccd95b8635bec1b; __ps_r=https://github.com/92bondstreet/lego/blob/main/workshops/1-craft-your-conviction.md; __ps_lu=https://www.vinted.fr/; __ps_did=pscrb_3887bc5c-d15d-4a7a-db8b-4a32e90357c4; __ps_fva=1769522758326; _ga=GA1.1.63679397.1769522758; _fbp=fb.1.1769522758612.203768521670272135; domain_selected=true; anon_id=b777cd8b-f8b1-4680-840f-a991a22d1e6f; non_dot_com_www_domain_cookie_buster=1; v_uid=174947498; v_sid=d4530467-1774828824; _pubcid=762c1448-f4b5-466d-a6dd-1b12d510a98b; panoramaId_expiry=1775433729243; panoramaId=d88b1fe963e32db2bc090f949ff0c8bd038a7d6c009dcbc0b4aa4bea0870a9c5; panoramaIdType=panoIndiv; cf_clearance=YKRMqbc9SwSCqXCXc7yHwmhQv01XGbl5jsed0vub50s-1775209470-1.2.1.1-kZzXh1p2wSVVuPxZmIIBJtAzF7mAzvBmQPJEjOSN_7VcXaigyXDgRNLn2kpIiaf8.1DWrlMXmkmpl0yuyd0DUVtZfDzebj8kNAKNQ9Qef6.AKy.mFtluCmROpYOLUJnbi2Xzdg9n9UoIlFdml13oxVTzzUJpeqMXPLqzXkVd_s_EuHQdQlsjhTzEdpGCTZ0axuKCC7ewbVYiXdSM3xRwphh26pThUvSgNZwcU8onOUA; __cf_bm=LIHqKO_x2iET5d_NAv7kzOhw4ruIr7dc_X2XDZv1p7Y-1775209470.3499525-1.0.1.1-EmBXrjUtrfvV1PZtOKTV7Ry_G9Hmj7J5V0v.1kiP.BMqZHlUjLde_JxueVQn_urQO8o_oA0C.PoOSfk5ay_upUc_E32u6kBi2hnpjubHs9s2A8ihH9ZyK4ThmwhItu5K5Bx_SZvHWCaSihgoxxTz3A; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhY2NvdW50X2lkIjoxMTg3MjYzNjIsImFwcF9pZCI6NCwiYXVkIjoiZnIuY29yZS5hcGkiLCJjbGllbnRfaWQiOiJ3ZWIiLCJleHAiOjE3NzU4MTQyNzEsImlhdCI6MTc3NTIwOTQ3MSwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwibG9naW5fdHlwZSI6MywicHVycG9zZSI6InJlZnJlc2giLCJzY29wZSI6InVzZXIiLCJzaWQiOiJkNDUzMDQ2Ny0xNzc0ODI4ODI0Iiwic3ViIjoiMTc0OTQ3NDk4IiwiY2MiOiJGUiIsImFuaWQiOiJiNzc3Y2Q4Yi1mOGIxLTQ2ODAtODQwZi1hOTkxYTIyZDFlNmYiLCJhY3QiOnsic3ViIjoiMTc0OTQ3NDk4In19.fZCtpkhhR8hSpymTqKfHR8gLzaTeQLmP3etR5W4KTmuzhHWZL4i3Hy1y9WhWY8fb7GggygmOul1HJinJWD3VVyfYRh34ontGbEdmZtxmgSlaXB6HIUIKJ-Rw09VgDNWtyNBgnNEf5JY2HVNXFuXY22Xx-uUB--C5ms1UC8eIBM3DfjZ7KYni8J_nLFI9E9AAXPzdqGFWdP169LbFAGwaAxapnesKIRXxJDJpHGBzk1v3Uv_vjFyJXcyjDvelaVqdatFOiGQktDPKSTOpunzqZw_gvJ69n5B09UzmslO1ppgGcEpp6qOT01BMIL1OoqtnF4G_tO0P177hHxHoKpamfQ; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhY2NvdW50X2lkIjoxMTg3MjYzNjIsImFwcF9pZCI6NCwiYXVkIjoiZnIuY29yZS5hcGkiLCJjbGllbnRfaWQiOiJ3ZWIiLCJleHAiOjE3NzUyMTY2NzEsImlhdCI6MTc3NTIwOTQ3MSwiaXNzIjoidmludGVkLWlhbS1zZXJ2aWNlIiwibG9naW5fdHlwZSI6MywicHVycG9zZSI6ImFjY2VzcyIsInNjb3BlIjoidXNlciIsInNpZCI6ImQ0NTMwNDY3LTE3NzQ4Mjg4MjQiLCJzdWIiOiIxNzQ5NDc0OTgiLCJjYyI6IkZSIiwiYW5pZCI6ImI3NzdjZDhiLWY4YjEtNDY4MC04NDBmLWE5OTFhMjJkMWU2ZiIsImFjdCI6eyJzdWIiOiIxNzQ5NDc0OTgifX0.zPoL3KL00_5Vd8vHrNSBO9l3QzxYP0sgcqedI49dAq7LPcJymaeCdML0nuhjdBRbBe2mL5FO9pQBA4D1NPbRH35n69wd4mz-ZqZycNGI2wpHLMAAzViPjyb98lcLKCEhkPjCnMJhwbYcQf_iBNLbMy-TxGLF6FcSr0d4t5daFZWbOMkld5YRb_tia9dtcqJD6HDU2XCuVrbiQVI-5UMJUZhT_pMqJ81aVMF2WRfhXM-_HDieGILHpuqteNx8-Y0b09M2-cXHsBEYNv_RkQbWr6sl1ASt0IVBlFEqkKvAgeIyR44O0rCMLezlHRAAPiXrjhPrgGGSFK5DpCGsD-Et0A; user-locale=fr; user-iso-locale=fr-FR; consent_version=eu; __ps_sr=_; __ps_slu=https://www.vinted.fr/session-refresh?ref_url=%2F; RoktRecogniser=3016222e-b2b0-4e12-9239-7a9cc61ff778; __gads=ID=ec5f870bf1d68fb9:T=1769524319:RT=1775209478:S=ALNI_MZP9wP_nbSmomeIUv3LmQBn86mkVw; __eoi=ID=9e4e9fcf043540c3:T=1769524319:RT=1775209478:S=AA-AfjaPNQRnQazA1LshgAZsnlEQ; _vinted_fr_session=OTdORGxvSGthT3Z2WlhibktoYTJJZzJXNC9aU1FHbjJRRk9RR1gyVkhTUlZJS1BCOGc5ejUrSWswZzNURDlGeCt1VkRVajU3aE81SHFwWUVPUUhORi9ETGlZWTVPeDd4bnF1YlJrSzVhWkVXc1lCcTBJeHF1SlE2QjZFQVppWVZweUpPQU1JbnJVQ3hrc29xdlJpUWloNEwrbXNkbTd6bW8wVzBEOERYdk1Xb3FhV3hCMjZBbTM0L2E2MlNHYSswT0dpUUdOSkRsaTFsYXpTZ1g1VzZ2WTROM0ozTUpDdDhGTC9LakVGazg1dEp0MnpRajNQcDZQMnIzSjhONzE4NlR3VmJvd1ZnWm1qNzlGT0lJNXh5bjNCU3FJOXAxU1VDditmQzBvMG0vemNnQ3UyM0laZWNEdzNsNVVWNVMyb04tLUlhMnRBeDFkNmFsSkgxUkdtL0dlSFE9PQ%3D%3D--8da5ba521c1eabf7d651b9d11f9b7b936fed5492; banners_ui_state=SUCCESS; OptanonConsent=isGpcEnabled=0&datestamp=Fri+Apr+03+2026+11%3A45%3A15+GMT%2B0200+(Central+European+Summer+Time)&version=202602.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=174947498&isAnonUser=1&hosts=&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1%2CC0005%3A1%2CV2STACK42%3A1%2CC0035%3A1%2CC0038%3A1&genVendors=V2%3A1%2CV1%3A1%2C&intType=1&geolocation=FR%3BIDF&AwaitingReconsent=false&prevHadToken=0; _ga_ZJHK1N3D75=GS2.1.s1775209473$o4$g1$t1775209515$j18$l0$h0; _ga_8H12QY46R8=GS2.1.s1775209473$o3$g1$t1775209515$j18$l0$h0; cto_bundle=ak7d219QNGYxZHVseGdDNm5pVXNNRyUyQlVkVEM5b1V5Q1JTNDBmSG9lNk9RTSUyRk5TeWJIYTMxTDAlMkJTV2hxa3FzSWFJb3prcjJzaDlxSDJQY2xMb1BNUDk2eHVSVWFVd3R2R0NId2Y1d3ZUTlgzS0dVayUyQlBJb3hhbDVwQ1ZjM0ZYMHBQZGNDY0FiVVolMkZHTFZ6VEQlMkZmVHNVbSUyRm5WQjBHM2lDekNXWjRxTnJKS1dlZE94SVdVJTJGajZNYlBkMlZmdjdmTWMwVGVP; cto_bidid=2YLStl96NzVFTVhDdU0lMkJhRkolMkYlMkJ0M1poajNzJTJCVSUyRkNtRXdldVJySFhMZFFXRFdBclc2Zjh0dm5xT3hucXoxaXFhZDBpTGdna0IlMkZyOHMlMkJ1Snl6eVpZZ0pxeEkxa2VJbVpMUkt2eUNTaXg0UFh1dVNwT3BpOVolMkZ3Z0c3eUcxMGslMkZGMnpjUVp5RGVaajNiZExSUTM2aDNFZEJUYlElM0QlM0Q; viewport_size=409; datadome=YKSv2SHn07WXBiPJEN_y8C3oO6K6VgR_hsc8g1LGkuuLxS9HNsGiGEsTHa7g7uawNyiscAG8Pl9j2ph5icbk0fPpaDxPj8JGiTbnRgrOI3hll0om_qvsf1L9wbTulyNt";

function isNotDefined(value) {
  return (value == null || (typeof value === "string" && value.trim().length === 0));
}

/**
 * Parse  
 * @param  {String} data - json response
 * @return {Object} sales
 */
const parse = data => {
  try {
    const {items} = data;

    return items.map(item => {
      const link = item.url;
      const price = item.total_item_price;
      const {photo} = item;
      const published = photo.high_resolution && photo.high_resolution.timestamp;

      return {
        link,
        price,
        title: item.title,
        published,
        'uuid': uuidv5(link, uuidv5.URL)
      }
    })
  } catch (error){
    console.error(error);
    return [];
  }
}



const scrape = async searchText => {
  try {

    if (isNotDefined(COOKIE)) {
      throw "vinted requires a valid cookie";
    }

    const response = await fetch(`https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1727382549&search_text=${searchText}&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids`, {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=0, i",
        "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": COOKIE
      },
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET"
    });

    if (response.ok) {
      const body = await response.json();

      return parse(body);
    }

    console.error(response);

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};


export {scrape};