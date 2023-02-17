const getPool = require('../db_connection')

module.exports = {
  
  // ユーザープロフィール取得
  getUserProfile: async (req) => {
    const query = req.query
    console.log("get")
    console.log(query)
    const firebase_auth_uid = query.firebase_auth_uid

    let connection = await getPool()
    if (firebase_auth_uid === undefined) {
      throw new Error('ログインされていません');
    }

    const sql = `SELECT name, address, birthday FROM users WHERE firebase_auth_uid = ?`
    let param = [firebase_auth_uid]
    const [rows1] = await connection.execute(sql, param)
    if (rows1.length == 0) {
      throw new Error('ユーザーが登録されていません');
    }
    return rows1
  },


  // ユーザープロフィール登録
  postUserProfile: async (req) => {
    const body = req.body
    const firebase_auth_uid = body.firebase_auth_uid
    const name = body.name
    const address = body.address
    const birthday = body.birthday
    console.log("post")
    console.log(body)

    let connection
    connection = await getPool()
    await connection.query('START TRANSACTION')
    if (name === undefined || address === undefined || birthday === undefined) {
      throw new Error('登録項目が不足しています');
    }
    
    const sql = `INSERT INTO users(firebase_auth_uid, name, address, birthday) VALUES(?, ?, ?, ?);`
    let param = [firebase_auth_uid, name, address, birthday]
    const [rows1] = await connection.execute(sql, param)
    if (rows1.affectedRows == 1) {
      connection.query('COMMIT')
    } else {
      connection.query('ROLLBACK')
      throw new Error('登録に失敗しました');
    }
    return rows1
  },


  // ユーザープロフィール更新
  putUserProfile: async (req) => {
    const body = req.body
    const firebase_auth_uid = body.firebase_auth_uid
    const name = body.name
    const address = body.address
    const birthday = body.birthday
    console.log("put")
    console.log(body)

    if (
      name === undefined && address === undefined && birthday === undefined
    ) {
      throw new Error('更新項目がありません');
    } else if (firebase_auth_uid === undefined) {
      throw new Error('ログインされていません');
    } else {
      let connection = await getPool()
      await connection.query('START TRANSACTION')
      let param = []
      
      let sql = `UPDATE users SET `
      sql = addSql(name, "name", param, sql)
      sql = addSql(address, "address", param, sql)
      sql = addSql(birthday, "birthday", param, sql)
      sql += " WHERE firebase_auth_uid = ?"
      param.push(firebase_auth_uid)
    
      const [rows1] = await connection.execute(sql, param)
      if (rows1.changedRows == 1) {
        connection.query('COMMIT')
      } else {
        connection.query('ROLLBACK')    
        throw new Error('更新に失敗しました')
      }
      return rows1
    }
  },


  // ユーザー削除
  deleteUserProfile: async (req) => {
    const body = req.body
    const firebase_auth_uid = body.firebase_auth_uid
    console.log("delete")
    console.log(body)
    
    if (firebase_auth_uid === undefined) {
      throw new Error('ログインされていません');
    }

    let connection
    connection = await getPool()
    await connection.query('START TRANSACTION')
    const sql = `DELETE FROM users WHERE firebase_auth_uid = ?`
    let param = [firebase_auth_uid]
    const [rows1] = await connection.execute(sql, param)
    if (rows1.affectedRows == 1) {
      connection.query('COMMIT')
    } else {
      connection.query('ROLLBACK')
      throw new Error('削除に失敗しました');    // firebase_auth_uidがusers表にない場合はここの処理でOK？ない場合はER_DUP_ENTRY
    }
    return rows1
  }
}


const addSql = (parameter, column_name, param, sql) => {
  if (parameter !== undefined) {
    sql += param.length === 0 ? column_name + " = ?" : ", " + column_name + " = ?"
    param.push(parameter)
  }
  return sql;
}