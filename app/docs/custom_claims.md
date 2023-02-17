# Firebase Custom Claims

## rules
{
    "userRank" : "admin" || "user",
    "status" : "newAccountRegistrant" ||     // 電話番号認証後
               "userInfoRegistrant" ||       // ユーザ情報登録
               "profilePhotoRegistrant" ||   // プロフィール写真登録
               "userInfoDetailRegistrant" || // ユーザ詳細情報登録
               "hobbyRegistrant" ||          // 趣味登録
               "usersAwaitingReview" ||      // 審査用写真・本人確認書類提出済みで本人確認審査待ち
               "serviceStart" ||             // 本人確認審査完了後
               "play" ||                     // チュートリアルも終わり通常利用モード
    "subscribe" : {
        "plan": "lv1" || "lv2",
        "start": "yyyymmdd",
        "end": "yyyymmdd",
    }
}