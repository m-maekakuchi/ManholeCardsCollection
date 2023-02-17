const getPool = require('../db_connection')

module.exports = {
  // カード情報取得
  getCardInfo: async (req) => {
    const query = req.query
    console.log("get")
    console.log(query)
    const firebase_auth_uid = query.firebase_auth_uid
    const prefecture = query.prefecture
    const type = query.type
    const serial_number = query.serial_number

    let connection = await getPool()
    let result = {}
    let param  = []
    let sql    = ""

    if (firebase_auth_uid === undefined) {
      throw new Error('ログインされていません');
    }

    if (type === "master") {    // 全て又は都道府県毎のカード情報を取得
      sql = `
        SELECT 
          serial_number
          , prefectures
          , city
          , version 
        FROM cards_master
      `
      sql = addSqlWhere(sql, param, prefecture)
      let [rows1] = await connection.execute(sql, param)
      result.cards = rows1

      sql = `
        SELECT
          cards_master_serial_number
          , concat(file_pass, "/" ,file_name) AS filepass
          , type
        FROM cards c
          JOIN photos p
            ON c.id = p.cards_id
          JOIN cards_master cm
            ON c.cards_master_serial_number = cm.serial_number
        WHERE c.firebase_auth_uid = ? AND p.type = "main"
      `
      param = [firebase_auth_uid]
      sql = addSqlWherePrefecture(sql, param, prefecture)
      let [rows2] = await connection.execute(sql, param)
      // main写真の登録があるカードにはfilepassを追加
      rows2.forEach (value => {
        result.cards.forEach (value2 => {
          if (value.cards_master_serial_number === value2.serial_number) {
            value2.filepass = value.filepass
          }
        })
      })
      return result
    } else if (type === "individual") {   // 個別のマンホールカードの情報を取得
      sql = `
        SELECT
          serial_number
          , prefectures
          , city
          , version
          , issue_date
          , comment
          , stock_link
          , distribute_location
          , location_link
        FROM cards_master cm
          JOIN cards_master_detail d
            ON cm.serial_number = d.cards_master_serial_number
        WHERE cm.serial_number = ?
      `
      param = [serial_number]
      let [rows1] = await connection.execute(sql, param)
      if (rows1.length > 1) {   // 配布場所が複数の場合、配布場所とリンクを配列にして追加する
        let distribute_location = rows1.map(value => {
          return value.distribute_location
        })
        let location_link = rows1.map(value => {
          return value.location_link
        })
        rows1[0].distribute_location = distribute_location
        rows1[0].location_link = location_link
      }
      result = rows1[0]

      sql = `
        SELECT
          concat(file_pass, "/" ,file_name) AS pass
          , type
        FROM cards c
          JOIN photos p
            ON c.id = p.cards_id
        WHERE c.firebase_auth_uid = ? AND c.cards_master_serial_number = ?;
      `
      param = [firebase_auth_uid, serial_number]
      let [rows2] = await connection.execute(sql, param)
      console.log(rows2)
      if (rows2.length > 0) {   // 写真の登録がある場合、そのパスを配列にしてresultに追加
        result.file = rows2
      }
      return result
    } else {    // 個人が所有しているマンホールカード検索
      sql = `
        SELECT
          serial_number
          , prefectures
          , city
          , version
          , date_format(collect_date, '%Y年%m月%d日') AS collect_date
          , concat(file_pass, "/" ,file_name) AS filepass
        FROM cards c
          JOIN cards_master cm
            ON c.cards_master_serial_number = cm.serial_number
          LEFT JOIN photos p
            ON c.id = p.cards_id
        WHERE c.firebase_auth_uid = ? AND (type = 'main' OR IsNull(type))
      `
      param = [firebase_auth_uid]
      sql = addSqlWherePrefecture(sql, param, prefecture)
      sql += ' ORDER BY collect_date desc'
      let [rows1] = await connection.execute(sql, param)
      result.cards = rows1

      // 所有カード枚数
      result.cards_num = result.cards.length

      // 全カード枚数
      sql = `SELECT COUNT(serial_number) AS cnt FROM cards_master`
      param = []
      sql = addSqlWhere(sql, param, prefecture)
      let cards_master_num = await connection.execute(sql, param)
      result.cards_master_num = cards_master_num[0][0].cnt
    }
    return result
  },


  // 取得したカードの登録
  postCardInfo: async (req) => {
    const body = req.body
    console.log("post")
    console.log(body)
    const firebase_auth_uid = body.firebase_auth_uid
    const collect_date = body.collect_date
    const serial_number = body.serial_number
    const file = body.file

    if (collect_date === undefined || serial_number === undefined) {
      throw new Error('登録項目が不足しています');
    } else if (firebase_auth_uid === undefined) {
      throw new Error('ログインされていません');
    } else {
      let connection = await getPool()
      await connection.query('START TRANSACTION')
      sql = `
        INSERT INTO cards (firebase_auth_uid, collect_date, cards_master_serial_number)
        VALUES (?, ?, ?)
      `
      param = [firebase_auth_uid, collect_date, serial_number]
      let [rows1] = await connection.execute(sql, param)
      if (rows1.affectedRows !== 1) {
        connection.query('ROLLBACK')    
        throw new Error('登録に失敗しました')
      }
      const photos_insertId = rows1["insertId"]   // card表の最新id
      
      sql = `
        INSERT INTO photos (firebase_auth_uid, file_pass, file_name, cards_id, type) 
        VALUES (?, ?, ?, ?, ?)
      `
      for (let value of file) {
        let [rows2] = await connection.execute(sql, [firebase_auth_uid, value.pass, value.name, photos_insertId, value.type])
        if (rows2.affectedRows !== 1) {
          connection.query('ROLLBACK')    
          throw new Error('登録に失敗しました')
        }
      }

      connection.query('COMMIT')
      return {result : "created", message : "カードの情報を登録しました"}
    }
  },


  // 取得したカード情報の変更
  putCardInfo: async (req) => {
    const body = req.body
    console.log("put")
    console.log(body)
    const firebase_auth_uid = body.firebase_auth_uid
    const collect_date = body.collect_date
    const serial_number = body.serial_number
    const cards_master_serial_number = body.cards_master_serial_number
    const file = body.file
    
    if (
      collect_date === undefined && serial_number === undefined && file === undefined
    ) {
      throw new Error('更新項目を入力してください');
    } else if (firebase_auth_uid === undefined) {
      throw new Error('ログインされていません');
    } else {
      let connection = await getPool()
      await connection.query('START TRANSACTION')
      
      let sql = `SELECT id FROM cards WHERE firebase_auth_uid = ? AND cards_master_serial_number = ?`
      let param = [firebase_auth_uid, cards_master_serial_number]
      let [rows1] = await connection.execute(sql, param)
      let update_cards_id = rows1[0].id
      console.log(update_cards_id)

      param = []
      sql = `UPDATE cards SET `
      sql = addUpdateSql(collect_date, "collect_date", param, sql)
      sql = addUpdateSql(serial_number, "cards_master_serial_number", param, sql)
      sql += " WHERE id = ?"
      param.push(update_cards_id)
      console.log(param)
      let [rows2] = await connection.execute(sql, param)
      console.log(rows2)
      if (rows2.changedRows !== 1) {
        connection.query('ROLLBACK')    
        throw new Error('更新に失敗しました')
      }

      sql = `DELETE FROM photos WHERE cards_id = ?`
      param = [update_cards_id]
      let [rows3] = await connection.execute(sql, param)
      console.log(rows3)
      if (rows3.affectedRows == 0) {
        connection.query('ROLLBACK')    
        throw new Error('更新に失敗しました')
      }
      
      sql = `
        INSERT INTO photos (firebase_auth_uid, file_pass, file_name, cards_id, type) 
        VALUES (?, ?, ?, ?, ?)
      `
      for (let value of file) {
        let [rows4] = await connection.execute(sql, [firebase_auth_uid, value.pass, value.name, update_cards_id, value.type])
        if (rows4.affectedRows !== 1) {
          console.log(rows4)
          connection.query('ROLLBACK')    
          throw new Error('更新に失敗しました')
        }
      }
      
      connection.query('COMMIT')
      return {result : "updated", message : "カードの情報を変更しました"}
    }
  },


  // 取得カードの削除
  deleteCardInfo: async (req) => {
    const body = req.body
    console.log("delete")
    console.log(body)
    const firebase_auth_uid = body.firebase_auth_uid
    const serial_number = body.serial_number

    let connection = await getPool()
    // 削除するcards表のidを取得
    sql = `
      SELECT id FROM cards 
      WHERE firebase_auth_uid = ? AND cards_master_serial_number = ?
    `
    let param = [firebase_auth_uid, serial_number]
    let [rows1] = await connection.execute(sql, param)
    delete_cards_id = rows1[0].id

    sql = `DELETE FROM photos WHERE cards_id = ?`
    param = [delete_cards_id]
    let [rows3] = await connection.execute(sql, param)
    console.log(rows3)

    sql = `DELETE FROM cards WHERE id = ?`
    param = [delete_cards_id]
    let [rows2] = await connection.execute(sql, param)
    console.log(rows2)
    

    return "deleted"
  }
}

const addSqlWhere = (sql, param, prefecture) => {
  if (prefecture !== undefined) {
    sql += ' WHERE prefectures = ?'
    param.push(prefecture)
  }
  return sql
}

const addSqlWherePrefecture = (sql, param, prefecture) => {
  if (prefecture !== undefined) {
    sql += ' AND cm.prefectures = ?'
    param.push(prefecture)
  }
  return sql
}

const addUpdateSql = (parameter, column_name, param, sql) => {
  if (parameter !== undefined) {
    sql += param.length === 0 ? column_name + " = ?" : ", " + column_name + " = ?"
    param.push(parameter)
  }
  return sql
}