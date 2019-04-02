import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

var myFailRate = new Rate("failed requests");


export let options = {
    stages: [
        { duration: "30s", target: 10 },
        { duration: "30s", target: 200 },
        { duration: "30s", target: 10 },
        { duration: "30s", target: 200 },
        { duration: "30s", target: 0 }
    ],
    thresholds: {
        "failed requests": ["rate<0.1"],
    }
};


export default function() {
    let txt = Math.random().toString(36).substring(7);

    let res = http.get("https://guarded-scrubland-78590.herokuapp.com/api/hash?password="+txt);
    myFailRate.add(res.json().password == "");
    check(res, {
            "status was 200": (r) => r.status == 200,
            "transaction time OK": (r) => r.timings.duration < 1500,
            "passowrd is not empty": (r) => r.json().password != ""
        });
    sleep(1);
}