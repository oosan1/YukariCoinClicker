//背景コインを作る
class CreateCoin {
    constructor() {
        this.material = coin_material;
        this.material.transparent = true;
        this.plane = new THREE.Mesh(coin_geometry, this.material);
        coin_group.add(this.plane);
        if (Math.random() < 0.5) {
            this.plane.position.set(- Math.random() * width / 2 +515, - coin_group_y + 40 + height / 2, 0);
        }else {
            this.plane.position.set(Math.random() * width / 2, - coin_group_y + 40 + height / 2, 0);
        };

        scene.add(coin_group);
        coin_del(this.plane);
    };
};

//パワーアップの価格管理
class PowerManager {
    constructor(kiri, zun, ita, maki, aka, koto) {
        if (typeof kiri == "undefined") {
            this.kiri = 20;
        }else {
            this.kiri = kiri;
        };
        if (typeof zun == "undefined") {
            this.zun = 100;
        }else {
            this.zun = zun;
        };
        if (typeof ita == "undefined") {
            this.ita = 1500;
        }else {
            this.ita = ita;
        };
        if (typeof maki == "undefined") {
            this.maki = 10000;
        }else {
            this.maki = maki;
        };
        if (typeof aka == "undefined") {
            this.aka = 50000;
        }else {
            this.aka = aka;
        };
        if (typeof koto == "undefined") {
            this.koto = 200000;
        }else {
            this.koto = koto;
        };
        this.yuka_near = 8000000000;
        this.yuka_over = 10000000000;
    };
};

class Geometry {
    constructor() {
        this.kiri = new THREE.PlaneGeometry(50, 50);
        this.zun = new THREE.PlaneGeometry(100, 100);
        this.ita = new THREE.PlaneGeometry(200, 200);
        this.maki = new THREE.PlaneGeometry(250, 250);
        this.aka = new THREE.PlaneGeometry(350, 350);
        this.koto = new THREE.PlaneGeometry(150, 150);
    };
};

class CreateChars {
    constructor(name, size, geometry) {
        this.counter = 0;
        this.position_per = 0.1;
        this.position_y = height / 2 + size - size / 4;
        this.count = 0;
        this.count2 = 1;
        this.startTime = true;
        this.char_endFlag = false;

        if (name == "koto") {
            //姉妹用
            this.begin_count = char_count;
            char_count += 2;

            this.texture = loader.load("./texture/char/" + name + "_R/1.png");
            this.texture.minFilter = THREE.LinearFilter; 
            this.texture.magFilter = THREE.LinearFilter;
            this.material = new THREE.MeshBasicMaterial({ map: this.texture,
                                                          alphaTest: .7,
                                                        })
            this.plane = new THREE.Mesh(geometry, this.material);
            this.random_x = - Math.random()
            //0.875は1ドット分だけ余白を減らすため
            this.position_Rx = this.random_x * ((width / 2 - size) - width / 2 + 457 - size * 0.875 * 3) - width / 2 + 457 - size * 0.875 * 3;
            this.plane.position.set(this.position_Rx, height / 2 + size - size / 4, 0);
            scene.add(this.plane);

            this.texture = loader.load("./texture/char/" + name + "_B/1.png");
            this.texture.minFilter = THREE.LinearFilter; 
            this.texture.magFilter = THREE.LinearFilter;
            this.material2 = new THREE.MeshBasicMaterial({ map: this.texture,
                                                          alphaTest: .7,
                                                        })
            this.plane2 = new THREE.Mesh(geometry, this.material2);
            this.plane2.position.set(this.position_Rx + size * 2, height / 2 + size - size / 4, 0);
            scene.add(this.plane2);
    
            this.timerId = setInterval(function(){
                if(this.position_y < - height / 2 + size - size / 4){
                    if (this.char_endFlag && Date.now() - this.startTime > (char_count - this.begin_count) * 200 + 7000) {
                        //ホワイトアウトが終了後、7000ms経ったら
                        this.per_y -= 1;
                        this.per_x -= 0.1;
                        this.char_y += this.per_y;
                        this.plane.position.y += this.per_y;
                        this.plane.position.x += this.per_x;
                        this.plane2.position.y += this.per_y;
                        this.plane2.position.x += this.per_x;

                        if (- height / 2 - size - 50 > this.char_y) {
                            //画面外まで跳んだら消える
                            scene.remove(this.plane);
                            this.plane.material.dispose();
                            this.plane.geometry.dispose();
    
                            scene.remove(this.plane2);
                            this.plane2.material.dispose();
                            this.plane2.geometry.dispose();
                            if (char_end_count == this.begin_count) {
                                //もし、最後のボイロなら
                                setTimeout(function() {
                                    endcreditsFlag = true;
                                }, 3000)
                            };

                            clearInterval(this.timerId);
                        };
                    }else {
                        //通常時
                        this.count += 1;
                        if (this.count > 6) {
                            if (yuka_endFlag) {
                                //ホワイトアウト後
                                if (this.startTime == true) {
                                    this.startTime = Date.now();
                                    this.char_y = - height / 2 + size - size / 4;
                                    this.per_y = 30;
                                    this.per_x = 15;
                                    this.char_endFlag = true;
                                };
                            }else {
                                this.texture = loader.load("./texture/char/" + name + "_R/" + this.count2 + ".png");
                                this.texture.minFilter = THREE.LinearFilter; 
                                this.texture.magFilter = THREE.LinearFilter;
                                this.material.map = this.texture;
                                this.position_Rx = this.random_x * ((width / 2 - size) - width / 2 + 457 - size * 0.875 * 3) - width / 2 + 457 - size * 0.875 * 3;
                                this.plane.position.set(this.position_Rx, - height / 2 + size - size / 4, 0);
        
                                this.texture = loader.load("./texture/char/" + name + "_B/" + this.count2 + ".png");
                                this.texture.minFilter = THREE.LinearFilter; 
                                this.texture.magFilter = THREE.LinearFilter;
                                this.material2.map = this.texture;
                                this.plane2.position.set(this.position_Rx + size * 2, - height / 2 + size - size / 4, 0);
        
                                this.count2 += 1;
        
                                if (this.count2 > 4) {
                                    this.count2 = 1;
                                }
                                this.count = 0;
                            };
                        };
                    };

                    if (char_count - this.begin_count > 150) {
                        //シーン内のボイロが150を超えた場合、古い物から削除する
                        scene.remove(this.plane);
                        this.plane.material.dispose();
                        this.plane.geometry.dispose();

                        scene.remove(this.plane2);
                        this.plane2.material.dispose();
                        this.plane2.geometry.dispose();

                        char_end_count += 2;
                        clearInterval(this.timerId);
                    };

                }else {
                    this.position_per += this.position_per * 0.05;
                    this.position_y -= this.position_per;
                    this.plane.position.y -= this.position_per;
                    this.plane2.position.y -= this.position_per;
                };
            }.bind(this), 16.666);
        
        }else {
            this.begin_count = char_count;
            char_count += 1;

            this.texture = loader.load("./texture/char/" + name + "/1.png");
            this.texture.minFilter = THREE.LinearFilter; 
            this.texture.magFilter = THREE.LinearFilter;
            this.material = new THREE.MeshBasicMaterial({ map: this.texture,
                                                          alphaTest: .8,
                                                        })
            this.plane = new THREE.Mesh(geometry, this.material);
            scene.add(this.plane);
            this.random_x = - Math.random()
            //0.875は1ドット分だけ余白を減らすため
            this.plane.position.set(this.random_x * ((width / 2 - size) - width / 2 + 457 - size * 0.875) - width / 2 + 457 - size * 0.875, height / 2 + size - size / 4, 0);

            this.timerId = setInterval(function(){
                if(this.position_y < - height / 2 + size - size / 4){
                    if (this.char_endFlag && Date.now() - this.startTime > (char_count - this.begin_count) * 200 + 7000) {
                        //ホワイトアウトが終了後、7000ms経ったら
                        this.per_y -= 1;
                        this.per_x -= 0.1;
                        this.char_y += this.per_y;
                        this.plane.position.y += this.per_y;
                        this.plane.position.x += this.per_x;
                        if (- height / 2 - size - 50 > this.char_y) {
                            //画面外まで跳んだら消える
                            scene.remove(this.plane);
                            this.plane.material.dispose();
                            this.plane.geometry.dispose();

                            if (char_end_count == this.begin_count) {
                                //もし、最後のボイロなら
                                setTimeout(function() {
                                    endcreditsFlag = true;
                                }, 3000)
                            };

                            clearInterval(this.timerId);
                        };
                    }else {
                        //通常時
                        this.count += 1;
                        if (this.count > 6) {
                            if (yuka_endFlag) {
                                //ホワイトアウト後
                                if (this.startTime == true) {
                                    this.startTime = Date.now();
                                    this.char_y = - height / 2 + size - size / 4;
                                    this.per_y = 30;
                                    this.per_x = 15;
                                    this.char_endFlag = true;
                                };
                            }else {
                                this.texture = loader.load("./texture/char/" + name + "/" + this.count2 + ".png");
                                this.texture.minFilter = THREE.LinearFilter; 
                                this.texture.magFilter = THREE.LinearFilter;
                                this.material.map = this.texture;
                                this.count2 += 1;
                                this.plane.position.set(this.random_x * ((width / 2 - size) - width / 2 + 457 - size * 0.875) - width / 2 + 457 - size * 0.875, - height / 2 + size - size / 4, 0);
                                if (this.count2 > 4) {
                                    this.count2 = 1;
                                };
        
                                this.count = 0;
                            };
                        };
                    };
                    if (char_count - this.begin_count > 150) {
                        //シーン内のボイロが150を超えた場合、古い物から削除する
                        scene.remove(this.plane);
                        this.plane.material.dispose();
                        this.plane.geometry.dispose();

                        char_end_count += 1;
                        clearInterval(this.timerId);
                    };

                }else {
                    this.position_per += this.position_per * 0.05;
                    this.position_y -= this.position_per;
                    this.plane.position.y -= this.position_per;
                };
            }.bind(this), 16.666);
        };
    };
};

class endcredits {
    constructor() {
        this.material = new THREE.MeshBasicMaterial({color: 0x0f0f0f,
                                                     transparent: true});
        this.geometry = new THREE.PlaneGeometry(width, height);
        this.plane = new THREE.Mesh(this.geometry, this.material);
        scene.add(this.plane);
        this.plane.position.y = height;
        endcredits_y = height;
    };
};
