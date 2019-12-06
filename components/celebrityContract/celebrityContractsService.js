const CelebContractsModel = require('./celebrityContractsModel')
const mongoose = require('mongoose')

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

const calculateCelebSharingPercentage = (totalCreditValue, contractObj, callback) => {

}

const getCelebIdWhoHaveContract = () =>
    new Promise((resolve, reject) => {
        setTimeout(() => {
            CelebContractsModel.distinct("memberId")
                .then((contractsCelebArray) => {
                    let celebContractIds = contractsCelebArray.map(s =>
                        mongoose.Types.ObjectId(s)
                    );
                    resolve(celebContractIds)
                })
                .catch(err => reject(err))
        }, 100)
    })

module.exports = {
    getCelebContractsForFan: getCelebContractsForFan,
    getCelebContractsByServiceType: getCelebContractsByServiceType,
    calculateCelebSharingPercentage: calculateCelebSharingPercentage,
    getCelebIdWhoHaveContract: getCelebIdWhoHaveContract
}