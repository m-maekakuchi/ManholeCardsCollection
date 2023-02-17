
module.exports = function getErrorRes(error) {
  console.log("-------------")
  console.error(error)
  console.log("-------------")
  // 独自例外発生
  if (error.code === undefined) {
    return {
      status: "error",
      status_code: 400,
      error: error.message
    }
  // 例外発生
  } else {
    if (error.code == "EAI_AGAIN") {
      return {
        status: "error",
        status_code: 500,
        error: "データベースが起動していません",
        code: error.code
      }
    } else if (error.code == "ER_DUP_ENTRY"){
      return {
        status: "error",
        status_code: 500,
        error: "同じカードを登録できません",
        code: error.code
      }
    } else if (error.code == "ER_NO_REFERENCED_ROW_2"){
      return {
        status: "error",
        status_code: 500,
        error: "登録されていないユーザーはカード登録できません",
        code: error.code
      }
    }
  }
};