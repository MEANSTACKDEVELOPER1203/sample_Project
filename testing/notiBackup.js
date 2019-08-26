var message = {
    to: dToken,
    collapse_key: 'Service-alerts',
    data: {
      serviceType: "Fan", title: 'Alert!!',
      body: "Greetings from CelebKonect! " + Uresult.firstName + " " + Uresult.lastName + " has become your fan. Happy Konecting !!",
    },
    notification: {
      title: 'Alert!!',
      body: "Greetings from CelebKonect! " + Uresult.firstName + " " + Uresult.lastName + " has become your fan. Happy Konecting !!",
    }

  };
  fcm.send(message, function (err, response) {
    if (err) {
      console.log(err)
    } else {



      // console.log("Successfully sent with resposne :", response);
    }
  });










  let message
  //console.log("Index ====== ", j)
  if (osType == "Android") {
    //console.log("OS TYPE 1====", osType)
    message = {
      to: dToken,
      collapse_key: 'Feed Alert!!',
      data: {
        serviceType: "Feed",
        title: 'Feed Alert!!',
        body: SMresult.firstName + " " + SMresult.lastName + " posted an update.",
        feedId: createdFeedObj._id,
        firstName: SMresult.firstName,
        avtar_imgPath: SMresult.avtar_imgPath
      },
    }
  }else if(osType =="IOS"){
    //console.log("OS TYPE 2====", osType)
   message = {
    to: dToken,
    notification: {
      body: SMresult.firstName + " " + SMresult.lastName + " posted an update.",
      feedId: createdFeedObj._id,
      firstName: SMresult.firstName,
      avtar_imgPath: SMresult.avtar_imgPath
      //title: 'Feed Alert!!',
      //body: "Greetings from CelebKonect! " +SMresult.firstName+" posted a feed. "+createdFeedObj.created_at,
      // createTime: time1,
    }
  }
}else{
  //console.log("OS TYPE Other 3====", osType)
  message:{}
}
  //console.log("message",message);
  fcm.send(message, function (err, response) {
    if (err) {
      console.log(err)
    } else {
      console.log("Successfully sent with resposne :", response);
    }

    //console.log("test");
  });











  