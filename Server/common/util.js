
class UtilHelp {    
 getToken(headers) {
    if (headers && headers.authorization) {
      let parted = headers.authorization.split(' ');
      if (parted.length === 2) {
        return parted[1];
      }
    }
  }

}

module.exports = UtilHelp;