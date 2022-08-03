const { NODE_ENV } = require('../config/env');
const { User, Account, Bot } = require('../models/user.model');
const { successfulRes, failedRes } = require('../utils/response');

exports.profileView = async (req, res) => {
  try {
    const { _id } = req.session.user;

    const user = await User.findById(_id).populate('accounts');

    return successfulRes(res, 200, user);
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.profileUpdate = async (req, res) => {
  try {
    const { _id } = req.session.user;
    const { first_name, last_name, email, photo } = req.body;

    let doc = await User.findById(_id).exec();

    doc.first_name = first_name ? first_name : doc.first_name;
    doc.last_name = last_name ? last_name : doc.last_name;
    doc.email = email ? email : doc.email;
    doc.photo = photo ? photo : doc.photo;

    const valid = doc.validateSync();
    if (valid) throw valid;
    await doc.save();
    req.session.user = doc;
    return successfulRes(res, 200, doc);
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.profileDelete = async (req, res) => {
  try {
    const { _id } = res.session.user;

    const response = await User.findByIdAndDelete(_id).exec();

    return successfulRes(res, 200, response);
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.getAccounts = async (req, res)=>{
  try{
    const {accounts} = req.session.user;
  
    let response = [];
    for(const e of accounts){
      const doc = await Account.findById(e).exec();
      response.push(doc);
    }

    return successfulRes(res, 200, response);
  }catch(e){
    return failedRes(res, 500, e);
  }
}

exports.addAccount = async (req, res) => {
  try {
    const { _id } = req.session.user;
    const { name, type, mobile } = req.body;

    const user = await User.findById(_id).exec();
    const account = new Account({
      id: mobile.substring(mobile.length-4),
      user: user._id,
      name,
      type,
      mobile,
      is_verified: NODE_ENV == 'dev' ? true : false,
    });

    await account.save();
    user.accounts.push(account._id);
    await user.save();
    req.session.user = user;

    return successfulRes(res, 200, user);
  } catch (e) {
    return failedRes(res, 500, e);
  }
};

exports.botCommand = async (req, res)=>{
  try{
    const account_id = req.params.account_id;
    /**
     * commands = 
     * [
     *  {
     *    msg: String,
     *    reply: String
     *  }
     * ]
     */
    const {commands} = req.body;
    const {enable} = req.query;
    const user_accounts = req.session.user.accounts;
    
    let bot;
    if(enable) {
      if(enable != 'true' && enable != 'false') return failedRes(res, 404, new Error(`Cant cast enable to boolean value`));
       bot = await Bot.findOneAndUpdate({account: account_id}, {enabled: enable}, {upsert: true, new: true}).exec();
    }
    if(!user_accounts.includes(account_id)) return failedRes(res, 400, new Error(`Invalid Account ID #${account_id}`));
    if(commands && Array.isArray(commands)){
      bot = await Bot.findOne({account: account_id}).exec();
      if(!bot) bot = new Bot({account: account_id});
  
      for(const e of commands){
        bot.autoReplies.set(`${e.msg}`, `${e.reply}`);
      }
  
      await bot.save();
    }



    return successfulRes(res, 200, bot);
  }catch(e){
    return failedRes(res, 500, e);
  }
}