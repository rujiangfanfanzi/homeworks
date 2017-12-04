let states = require('../states').states;
const UserManager = require('../entities/user').User;
var debug = require('debug')('log');
/**
 * 用于处理邮件与用户的交互
 * @param {*} socket 
 */
function Mail(socket) {
  this.title = '';
  this.body = [];
  this.address = '';

  socket.on(states.MAIL_WRITE, (machine, socket, data) => {
    this.stateWrite(machine, socket, data);
  });
}

/**
 * 邮件写状态下，基本的接收入口
 * @param {*} machine 
 * @param {*} socket 
 * @param {*} data 
 */
Mail.prototype.stateWrite = function (machine, socket, data) {
  debug('log' + 'state write');
  //console.log('state write');
  if (!machine.action) {
    debug('log' + 'state write home');
    //console.log('state write home');
    this.stateWriteHome(machine, socket, data);
  } else {
    debug('log' + 'inside not login else');
    //console.log('inside not login else');
    switch (machine.action) {
    case 'address':
      this.getAddress(machine, socket, data);
      break;
    case 'title':
      this.getTitle(machine, socket, data);
      break;
    case 'body':
      this.getBody(machine, socket, data);
      break;
    case 'wait':
      debug('log' + 'inside not login wait');
      //console.log('inside not login wait');
      this.stateWriteWait(machine, socket, data);
      break;
    }
  }
};

/**
 * 写邮件的主页面
 * @param {*} machine 
 * @param {*} socket 
 * @param {*} data 
 */
Mail.prototype.stateWriteHome = function (machine, socket, data) {
  socket.write('\n请输入你要修改的内容，\n\t1.收件人地址\n\t2.标题\n\t3.正文内容\n\t4.发送邮件\n');
  machine.action = 'wait';
  debug('log' + data);
};


/**
 * 主页面接收用户输入的函数
 * @param {*} machine 
 * @param {*} socket 
 * @param {*} data 
 */
Mail.prototype.stateWriteWait = function (machine, socket, data) {
  debug('log' + 'state write');
  //console.log('state write');
  let input = machine.getCleanedString(socket, data);
  debug('log' + 'input = ' + input);
  //console.log('input = ' + input);
  switch (input) {
  case '1':
    this.stateWriteAddressWait(machine, socket, data);
    break;
  case '2':
    this.stateWriteTitleWait(machine, socket, data);
    break;
  case '3':
    this.stateWriteBodyWait(machine, socket, data);
    break;
  case '4':
    break;
  default:
    debug('log' + 'inside not login wait default');
    //console.log('inside not login wait default');
    break;
  }
};
/**
 * 写邮件时，接收地址输入的函数
 * @param {*} machine 
 * @param {*} socket 
 * @param {*} data 
 */
Mail.prototype.stateWriteAddressWait = function (machine, socket, data) {
  socket.write('请输入接收用户的地址:\n');
  machine.action = 'address';
  debug('log' + data);
};


/**
 * 写邮件时，接收标题输入的函数
 * @param {*} machine 
 * @param {*} socket 
 * @param {*} data 
 */
Mail.prototype.stateWriteTitleWait = function (machine, socket, data) {
  socket.write('请输入标题:\n');
  machine.action = 'title';
  debug('log' + data);
};

/**
 * 写邮件时，接收正文输入的函数
 * @param {*} machine 
 * @param {*} socket 
 * @param {*} data 
 */
Mail.prototype.stateWriteBodyWait = function (machine, socket, data) {
  socket.write('请输入邮件内容:\n');
  machine.action = 'body';
  debug('log' + data);
};

Mail.prototype.getTitle = function (machine, socket, data) {
  this.title = machine.getCleanedString(socket, data);
  socket.write('标题更新成功！当前标题是: ' + this.title + '\n');
  this.stateWriteHome(machine, socket, data);
};

Mail.prototype.getAddress = function (machine, socket, data) {
  let address = machine.getCleanedString(socket, data);
  if (!UserManager.isAddress(address)) {
    socket.write('地址不存在！请重新输入:\n');
    return;
  }
  this.address = address;
  socket.write('地址更新成功！当前地址是: ' + this.address + '\n');
  this.stateWriteHome(machine, socket, data);
};

Mail.prototype.getBody = function (machine, socket, data) {
  let input = machine.getCleanedString(socket, data);
  if (input === '.exit') {
    socket.write('正文更新成功！当前正文内容是:\n');
    for (let i = 0; i < this.body.length; i++) {
      socket.write(this.body[i] + '\n\r');
    }
    socket.write('正文结束\n');
    this.stateWriteHome(machine, socket, data);
  } else {
    this.body.push(input);
  }

};

exports.Mail = Mail;