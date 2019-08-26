const CelebContractsModel = require('./celebrityContractsModel')

const getCelebContractsForFan = (celebrityId, callback) => {
    CelebContractsModel.findOne(
        { $and: [{ memberId: celebrityId + "" }, { serviceType: "fan" }, { isActive: true }] }, (err, celebrityContractObj) => {
            if (err) {
                callback(err, null)
            }
            else {
                callback(null, celebrityContractObj)
            }
        });
}

const getCelebContractsByServiceType = (celebrityId, serviceType, callback) => {
    CelebContractsModel.findOne(
        { $and: [{ memberId: celebrityId + "" }, { serviceType: serviceType }, { isActive: true }] }, (err, celebrityContractObj) => {
            if (err) {
                callback(err, null)
            }
            else {
                callback(null, celebrityContractObj)
            }
        });
}

module.exports = {
    getCelebContractsForFan: getCelebContractsForFan,
    getCelebContractsByServiceType: getCelebContractsByServiceType
}