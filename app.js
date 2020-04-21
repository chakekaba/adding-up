'use strict';
//Node.jsに用意されたモジュールを呼び出している。
const fs = require('fs');//ファイルを取り扱うためのモジュール
const readline = require('readline');//ファイルを1行ずつ読み込むためのモジュール
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ 'input': rs, 'output': {}});
const prefectureDataMap = new Map(); //key: 都道府県, value: 集計データオブジェクト

rl.on('line', (lineString) => {
    /**
     * rlオブジェクトでlineというイベントが発生したらこの無名関数が呼ばれる
     * lineイベント：行末文字(\n, \r, \r\n)が存在するとき
     * ファイルからデータを抜き出す関数
     */
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);//15~19歳の人口
    if (year === 2010 || year === 2015) {
        let value = prefectureDataMap.get(prefecture);
        if (!value) {//keyが空(undefined)の場合!False = True となる
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }

        if (year === 2010) {
            value.popu10 = popu;
        }

        if (year === 2015) {
            value.popu15 = popu;
        }

        prefectureDataMap.set(prefecture, value)
    }
});

rl.on('close', () => {
    // 都道府県ごとの変化率を計算
    for (let [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }
    
    /**
     * Array.from(prefectureDataMap)：連想配列を普通の配列に変換
     * 
     */
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });

    //見やすく整形
    //array.map(val)；arrayの要素それぞれに与えられた関数を適用した内容に変換する
    const rankingStrings = rankingArray.map(([key, value]) => {
        return key + ": " + value.popu10 + "=>" + value.popu15 + " 変化率:" + value.change;
    })
    console.log(rankingStrings);
})