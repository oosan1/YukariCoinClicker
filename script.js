/**
 *  ゆかりコインクリッカー
**/

//Three.jsの設定等
let width = window.innerWidth;
let height = window.innerHeight;

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#graphics"),
    alpha: true,
});
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 10);
camera.position.set(0, 0, 10);

const light = new THREE.AmbientLight(0xFFFFFF, 1.0);
scene.add(light);

const coin_group = new THREE.Group();
loader = new THREE.TextureLoader()
let coin_texture = loader.load("./texture/yukariCoin-Borderless_400PNG1.png");
coin_texture.minFilter = THREE.LinearFilter; 
coin_texture.magFilter = THREE.LinearFilter;
coin_material = new THREE.MeshBasicMaterial({ map: coin_texture,
                                               alphaTest: 0.3,
                                               opacity: 0.32,
                                               transparent: true,
                                            })
coin_geometry = new THREE.PlaneGeometry(80, 80);
char_geometry = new Geometry();
//左のキャラ
let char_list = [];
let char_count = 0;

//コインに関しての設定
var coin_count = 0;
var coin_every_second = 0; //コイン毎秒
var coin_click_per = 1; //クリック毎コイン
var cookieFlag = false;

let coin_group_y = 0;
let coin_change_check = 0;

//ゆかりイベント(エンディング)に関して
let yuka_trigger = false;
let yuka_position = 0;
let yuka_position2 = 0;
let yuka_texture_now = 0;
let yuka_timerId;
let yuka_endFlag = false;
let yuka_timeout_Flag = false;
let endcreditsFlag = false;
let char_end_count = 0;
let yuka_per_x = 30;
let yuka_per_y = 1;
let yuka_downcount = 0;
let endpullFlag = true;
let endcredits_BG;
let endcredits_y = 0;
let endwordFlag = false;
let endedFlag = false;

document.getElementById("coin").onclick = function(event) {
    if (cookieFlag) {
        coin_count += coin_click_per;
    }
};

const Cookie_onFlag = localStorage.getItem("Cookie_flag");
if (Cookie_onFlag == null) {
    document.getElementById("cookie_btn").onclick = function(event) {
        const btn = document.getElementById("cookie_box");
        btn.classList.add("invisible");
        if (typeof Cookies.get("YCC_Count") == "undefined") {
            coin_count = 0;
            coin_every_second = 0; //コイン毎秒
            coin_click_per = 1; //クリック毎コイン
        }else {
            coin_count = Number(Cookies.get("YCC_Count"));
            coin_every_second = Number(Cookies.get("YCC_Every")); //コイン毎秒
            coin_click_per = Number(Cookies.get("YCC_Per")); //クリック毎コイン
        };
        cookieFlag = true;
        localStorage.setItem("Cookie_flag", "on");
    };
}else {
    const Cookie_btn = document.getElementById("cookie_box");
    Cookie_btn.classList.add("invisible");
    if (typeof Cookies.get("YCC_Count") == "undefined") {
        coin_count = 0;
        coin_every_second = 0; //コイン毎秒
        coin_click_per = 1; //クリック毎コイン
    }else {
        coin_count = Number(Cookies.get("YCC_Count"));
        coin_every_second = Number(Cookies.get("YCC_Every")); //コイン毎秒
        coin_click_per = Number(Cookies.get("YCC_Per")); //クリック毎コイン
    };
    cookieFlag = true;
};

let texture_count = 0;
setInterval(TextureAnim, 50);

//レベルアップ基準
let pow_mgr = new PowerManager();

resize();
window.addEventListener("resize", resize);

tick();

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    camera.left = width / - 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = height / - 2;
    camera.updateProjectionMatrix();
};

function tick() {
    coin_group.position.y -= 5;
    coin_group_y -= 5;
    coin_num_check();
    coin_count_check();
    renderer.render(scene, camera);

    requestAnimationFrame(tick);
};

//画面外のコインを削除
async function coin_del(coin) {
    while (coin.getWorldPosition(new THREE.Vector3())["y"] > - height / 2 - 40) {
        await waitFunc();
    };
    coin_group.remove(coin);
    coin.material.dispose();
    coin.geometry.dispose();
};

function waitFunc() {
    return new Promise(function(resolve) {
        setTimeout(function() { resolve() }, 2000);
    });
};

//コインのテクスチャ
function TextureAnim() {
    coin_texture = loader.load("./texture/video/" + texture_count + ".png");
    coin_texture.minFilter = THREE.LinearFilter; 
    coin_texture.magFilter = THREE.LinearFilter;
    coin_material = new THREE.MeshBasicMaterial({ map: coin_texture,
                                                     alphaTest: 0.3,
                                                     opacity: 0.32,
                                                     transparent: true,});
    if (texture_count > 10) {
        texture_count = 0;
    } else {
        texture_count += 1;
    };
};

//コイン数管理
function coin_count_check() {
    if (cookieFlag) {
        Cookies.set("YCC_Count", Math.floor(coin_count));
        Cookies.set("YCC_Every", Math.floor(coin_every_second));
        Cookies.set("YCC_Per", Math.floor(coin_click_per));
    };

    document.getElementById("count").textContent = unit_conv(coin_count); //コイン数を反映
    document.getElementById("every").textContent = unit_conv(coin_every_second) + " yc/s";
    document.getElementById("per").textContent = unit_conv(coin_click_per) + " yc/c";
};

//単位変換
function unit_conv(count) {
    if (Math.trunc(count) >= 1000000000000) {
        let count_conv = Math.trunc(count) / 1000000000000
        count_conv = Math.floor(count_conv * 100) / 100
        return count_conv.toFixed(2) + "兆" //コイン数を反映
    }else if (Math.trunc(count) >= 100000000) {
        let count_conv = Math.trunc(count) / 100000000
        count_conv = Math.floor(count_conv * 100) / 100
        return count_conv.toFixed(2) + "億"; //コイン数を反映
    }else if (Math.trunc(count) >= 10000) {
        let count_conv = Math.trunc(count) / 10000
        count_conv = Math.floor(count_conv * 100) / 100;
        return count_conv.toFixed(2) + "万"; //コイン数を反映
    }else {
        return Math.trunc(count); //コイン数を反映
    };
};

//コイン管理
function coin_num_check() {
    const kiri = document.getElementById("kiri");
    const zun = document.getElementById("zun");
    const ita = document.getElementById("ita");
    const maki = document.getElementById("maki");
    const aka = document.getElementById("aka");
    const koto = document.getElementById("koto");
    const yuka = document.getElementById("yuka");

    coin_count += coin_every_second / 60;
    //コインの数が変わった瞬間を監視
    if (yuka_trigger) {
        //イベント時は停止
    }else {
        if (Math.trunc(coin_count) - coin_change_check < 7) {
            for (let step = 0; step < Math.trunc(coin_count) - coin_change_check; step++) {
                new CreateCoin();
            };
        }else {
            for (let step = 0; step < 7; step++) {
                new CreateCoin();
            }; 
        }
        coin_change_check = Math.trunc(coin_count);
    };

    if (coin_count >= pow_mgr.kiri) {
        kiri.classList.remove("unlock");
        kiri.classList.add("over");
        kiri.classList.add("unlock");
        kiri.title = unit_conv(pow_mgr.kiri) + "ゆかりコイン欲しい";

    }else if (kiri.classList.contains("unlock")) {
        kiri.classList.remove("over");
        kiri.title = unit_conv(pow_mgr.kiri) + "ゆかりコイン欲しい";
    }else {
        kiri.classList.remove("over");
    }

    if (coin_count >= pow_mgr.zun) {
        zun.classList.remove("unlock");
        zun.classList.add("over");
        zun.classList.add("unlock");
        zun.title = unit_conv(pow_mgr.zun) + "ゆかりコイン欲しい";
    }else if (zun.classList.contains("unlock")) {
        zun.classList.remove("over");
        zun.title = unit_conv(pow_mgr.zun) + "ゆかりコイン欲しい";
    }else {
        zun.classList.remove("over");
    }

    if (coin_count >= pow_mgr.ita) {
        ita.classList.remove("unlock");
        ita.classList.add("over");
        ita.classList.add("unlock");
        ita.title = unit_conv(pow_mgr.ita) + "ゆかりコイン欲しい";
    }else if (ita.classList.contains("unlock")) {
        ita.classList.remove("over");
        ita.title = unit_conv(pow_mgr.ita) + "ゆかりコイン欲しい";
    }else {
        ita.classList.remove("over");
    }

    if (coin_count >= pow_mgr.maki) {
        maki.classList.remove("unlock");
        maki.classList.add("over");
        maki.classList.add("unlock");
        maki.title = unit_conv(pow_mgr.maki) + "ゆかりコイン欲しい";
    }else if (maki.classList.contains("unlock")) {
        maki.classList.remove("over");
        maki.title = unit_conv(pow_mgr.maki) + "ゆかりコイン欲しい";
    }else {
        maki.classList.remove("over");
    }

    if (coin_count >= pow_mgr.aka) {
        aka.classList.remove("unlock");
        aka.classList.add("over");
        aka.classList.add("unlock");
        aka.title = unit_conv(pow_mgr.aka) + "ゆかりコイン欲しい";
    }else if (aka.classList.contains("unlock")) {
        aka.classList.remove("over");
        aka.title = unit_conv(pow_mgr.aka) + "ゆかりコイン欲しい";
    }else {
        aka.classList.remove("over");
    }

    if (coin_count >= pow_mgr.koto) {
        koto.classList.remove("unlock");
        koto.classList.add("over");
        koto.classList.add("unlock");
        koto.title = unit_conv(pow_mgr.koto) + "ゆかりコイン欲しい";
    }else if (koto.classList.contains("unlock")) {
        koto.classList.remove("over");
        koto.title = unit_conv(pow_mgr.koto) + "ゆかりコイン欲しい";
    }else {
        koto.classList.remove("over");
    }
    if (endedFlag || typeof Cookies.get("YCC_Ended") != "undefined") {
        //何もしない
    }else {
        if (coin_count >= pow_mgr.yuka_near && coin_count < pow_mgr.yuka_over) {
            yuka.classList.remove("over");
            yuka.classList.add("near");
            yuka.title = "もぞもぞ....";
        }else if (coin_count > pow_mgr.yuka_over) {
            yuka.classList.remove("near")
            yuka.classList.add("over");
            yuka.title = "...!";
        }else if (yuka.classList.contains("near")) {
            yuka.classList.remove("over");
            yuka.classList.remove("near");
            yuka.title = "見つかった！？ちょっと待ってて";
        }else {
            yuka.classList.remove("over");
            yuka.classList.remove("near");
            yuka.title = "見つかった！？ちょっと待ってて";
        };
    };
};

//ゆかりイベント
function yukaEvent() {
    const yuka_texture = loader.load("./texture/yukari/1.png");
    yuka_texture.minFilter = THREE.LinearFilter; 
    yuka_texture.magFilter = THREE.LinearFilter;
    yuka_material = new THREE.MeshBasicMaterial({ map: yuka_texture,
                                                  alphaTest: 0.5,
                                                  transparent: true,
                                                });
    yuka_geometry = new THREE.PlaneGeometry(640, 640);

    const plane = new THREE.Mesh(yuka_geometry, yuka_material);
    scene.add(plane);
    plane.position.set(- width / 2 + 137, height / 2 + 320, 0);
    yuka_position = height / 2 + 320;
    yuka_timerId = setInterval(animYuka, 16.666, plane, yuka_material)
};

function animYuka(plane, yuka_material, position_y) {
    const overlay = document.getElementById("end_overlay");
    if (yuka_position <= height / 2 - 320 || yuka_endFlag) {
        //空から降ってくる
        yuka_position2 += 1;
        if (yuka_position2 > 8) {
            //チャージ、発射
            if (yuka_texture_now > 59) {
                yuka_texture_now = 44;
                if (yuka_timeout_Flag) {
                    //一度タイムアウトを設定したなら待機
                }else {
                    yuka_timeout_Flag = true;
                    //ホワイトアウト開始
                    overlay.classList.add("end");
                    setTimeout(function(overlay, yuka_material) {
                        yuka_endFlag = true;
                        const yuka_texture = loader.load("./texture/yukari/1.png");
                        yuka_texture.minFilter = THREE.LinearFilter; 
                        yuka_texture.magFilter = THREE.LinearFilter;
                        yuka_material.map = yuka_texture;

                        const back = document.getElementById("body");
                        back.classList.add("end");
                        overlay.classList.add("end2");
                    }, 13000, overlay, yuka_material);
                    //timeoutを二重に設定しないようにする
                };
            };
            if (yuka_endFlag) {
                //ホワイトアウトが終わったらエンドロールまで待機
                if (endcreditsFlag) {
                    if (yuka_position < height / 2 + 20 && yuka_downcount == 0) {
                        //上に跳ぶ
                        yuka_per_x -= .5;
                        plane.position.x += yuka_per_x;
                        plane.position.y += 9;
                        yuka_position += 9;
                    }else if (yuka_downcount > 49 && endpullFlag){
                        endcredits_BG = new endcredits();
                        endpullFlag = false;
                    }else if (yuka_downcount > 49) {
                        //上に飛んだあと、下にスタッフロールを引っ張る
                        yuka_per_y = yuka_per_y * 1.02;
                        yuka_position -= yuka_per_y;
                        plane.position.y -= yuka_per_y;
                        if (endcredits_y > 10) {
                            endcredits_y -= yuka_per_y;
                            endcredits_BG.plane.position.y -= yuka_per_y;
                        }else if (endwordFlag) {
                            //タイムアウトを二重にセットしない
                        }else {
                            setTimeout(endcredits_word, 5000, "プログラム", "オオサン博士");
                            setTimeout(endcredits_word, 15000, "イラスト ボイロ達", " 手巻");
                            setTimeout(endcredits_word, 25000, "イラスト ゆかりコイン", " ぺるこ");
                            setTimeout(allreset, 35000);
                            endcredits_BG.plane.position.y = 0;
                            endwordFlag = true;
                        };
                    }else {
                        yuka_downcount += 1;
                    };
                };
            }else {
                yuka_position2 = 0;
                yuka_texture_now += 1;
                const yuka_texture = loader.load("./texture/yukari/" + yuka_texture_now + ".png");
                yuka_texture.minFilter = THREE.LinearFilter; 
                yuka_texture.magFilter = THREE.LinearFilter;
                yuka_material.map = yuka_texture;
            }
        };
    }else {
        yuka_position -= .5;
        plane.position.y -= .5;
    }
};

function endcredits_word(title, name) {
    let count = 0;
    let titleFlag = false;
    let nameFlag = false;
    const end_title = document.getElementById("end_title");
    const end_name = document.getElementById("end_name");

    const timerId = setInterval(function() {
        if (count > title.length) {
            titleFlag = true;
        }else {
            end_title.textContent = title.substr(0, count);
        };
        if (count > name.length) {
            nameFlag = true;
        }else {
            end_name.textContent = name.substr(0, count);
        };
        if (titleFlag && nameFlag) {
            clearInterval(timerId);
        };
        count += 1;
    }, 100);
};

function allreset() {
    coin_every_second = 0; //コイン毎秒
    coin_click_per = 1; //クリック毎コイン
    const end_title = document.getElementById("end_title");
    const end_name = document.getElementById("end_name");
    const count = document.getElementById("count");
    const per = document.getElementById("per");
    const every = document.getElementById("every");
    const coin_button = document.getElementById("coin");
    const kiri = document.getElementById("kiri");
    const zun = document.getElementById("zun");
    const ita = document.getElementById("ita");
    const maki = document.getElementById("maki");
    const aka = document.getElementById("aka");
    const koto = document.getElementById("koto");

    end_title.classList.add("invisible");
    end_name.classList.add("invisible");

    let per_count = 0;
    let end_position_y = 0;
    setTimeout(function() {
        alert("実績(追加予定)\nエンディングまでがチュートリアル");
    }, 2000);
    const timerId = setInterval(function() {
        endcredits_BG.plane.position.y -= per_count;
        end_position_y -= per_count;
        if (- height > end_position_y) {
            kiri.classList.remove("invisible");
            zun.classList.remove("invisible");
            ita.classList.remove("invisible");
            maki.classList.remove("invisible");
            aka.classList.remove("invisible");
            koto.classList.remove("invisible");
            count.classList.remove("invisible");
            per.classList.remove("invisible");
            every.classList.remove("invisible");
            coin_button.classList.remove("invisible");
            yuka_endFlag = false;
            yuka_trigger = false;
            pow_mgr = new PowerManager();
            Cookies.set("YCC_Ended", "true");
            endedFlag = true;
            clearInterval(timerId);
        };
        per_count += 1;
    }, 16.666);
};


document.getElementById("kiri").onclick = function(event) {
    const kiri = document.getElementById("kiri");
    if (kiri.classList.contains("over")) {
        coin_every_second += 1;
        coin_count -= pow_mgr.kiri;
        pow_mgr.kiri = Math.trunc(pow_mgr.kiri * 1.05);
        char_list.push(new CreateChars("kiri", 25, char_geometry.kiri));
    };
};

document.getElementById("zun").onclick = function(event) {
    const zun = document.getElementById("zun");
    if (zun.classList.contains("over")) {
        coin_every_second += 5;
        coin_count -= pow_mgr.zun;
        pow_mgr.zun = Math.trunc(pow_mgr.zun * 1.04);
        char_list.push(new CreateChars("zun", 50, char_geometry.zun));
    };
};

document.getElementById("ita").onclick = function(event) {
    const ita = document.getElementById("ita");
    if (ita.classList.contains("over")) {
        coin_click_per += 10;
        coin_count -= pow_mgr.ita;
        pow_mgr.ita = Math.trunc(pow_mgr.ita * 1.03);
        char_list.push(new CreateChars("ita", 100, char_geometry.ita));
    };
};

document.getElementById("maki").onclick = function(event) {
    const maki = document.getElementById("maki");
    if (maki.classList.contains("over")) {
        coin_every_second += 50;
        coin_count -= pow_mgr.maki;
        pow_mgr.maki = Math.trunc(pow_mgr.maki * 1.02);
        char_list.push(new CreateChars("maki", 125, char_geometry.maki));
    };
};

document.getElementById("aka").onclick = function(event) {
    const aka = document.getElementById("aka");
    if (aka.classList.contains("over")) {
        coin_every_second += 1000;
        coin_count -= pow_mgr.aka;
        pow_mgr.aka = Math.trunc(pow_mgr.aka * 1.01);
        char_list.push(new CreateChars("aka", 175, char_geometry.aka));
    };
};

document.getElementById("koto").onclick = function(event) {
    const koto = document.getElementById("koto");
    if (koto.classList.contains("over")) {
        coin_click_per += 2000;
        coin_count -= pow_mgr.koto;
        pow_mgr.koto = Math.trunc(pow_mgr.koto * 1.005);
        char_list.push(new CreateChars("koto", 75, char_geometry.koto));
    };
};

document.getElementById("yuka").onclick = function(event) {

    const yuka_near = document.getElementById("yuka");
    const count = document.getElementById("count");
    const per = document.getElementById("per");
    const every = document.getElementById("every");
    const coin_button = document.getElementById("coin");
    const kiri = document.getElementById("kiri");
    const zun = document.getElementById("zun");
    const ita = document.getElementById("ita");
    const maki = document.getElementById("maki");
    const aka = document.getElementById("aka");
    const koto = document.getElementById("koto");
    if (yuka.classList.contains("over") && yuka_trigger == false && typeof Cookies.get("YCC_Ended") == "undefined") {
        yuka_trigger = true;
        count.classList.add("invisible");
        per.classList.add("invisible");
        every.classList.add("invisible");
        coin_button.classList.add("invisible");
        kiri.classList.add("invisible");
        zun.classList.add("invisible");
        ita.classList.add("invisible");
        maki.classList.add("invisible");
        aka.classList.add("invisible");
        koto.classList.add("invisible");
        yuka_near.classList.add("click");
        yukaEvent();
    };
};
