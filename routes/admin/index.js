const router = require("express").Router();
const User = require("../../model/User");
const Deposit = require("../../model/Deposit");
const Withdraw = require("../../model/Withdraw");
const History = require("../../model/History");
const { ensureAdmin } = require("../../config/auth");
const comma = require("../../utils/comma");
const bcrypt = require("bcryptjs");
const Site = require("../../model/Site");
const getSite = require("../../lib/getSite");
const uuid = require("uuid");


router.get("/", ensureAdmin, async (req, res) => {
    try {
        const users = await User.find({ isAdmin: false });
        const pendingDeposits = await Deposit.find({ status: "pending" });
        const pendingWithdrawals = await Withdraw.find({ status: "pending" });
        return res.render("admin/dashboard", { layout: "layout3", comma, users, pendingDeposits, pendingWithdrawals, res, req });
    }
    catch (err) {
        return res.redirect(303,"/admin");
    }
});

router.get("/settings", ensureAdmin, async (req, res) => {
    try {
        const site = await getSite();
        return res.render("admin/settings", { req, res, site, layout: "layout3" });
    } catch (err) {
        return res.redirect(303,"/admin")
    }
});

router.post("/settings/addresses", ensureAdmin, async (req, res) => {
    try {
        const {
            bitcoinAddress,
            bchAddress,
            ethereumAddress,
            usdtAddress,
        } = req.body;
        const siteExists = await Site.findOne({});
        if (siteExists) {
            await Site.updateOne({ _id: siteExists._id }, {
                bitcoinAddress: bitcoinAddress ? bitcoinAddress : siteExists.bitcoinAddress,
                bchAddress: bchAddress ? bchAddress : siteExists.bchAddress,
                ethereumAddress: ethereumAddress ? ethereumAddress : siteExists.ethereumAddress,
                usdtAddress: usdtAddress ? usdtAddress : siteExists.usdtAddress,
            })
        } else {
            const newSite = new Site({
                bitcoinAddress,
                ethereumAddress,
                usdtAddress,
            });
            await newSite.save();
        }

        req.flash("Addresses updated successfully");
        return res.redirect(303,"/admin/settings");

    } catch (err) {
        return res.redirect(303,"/admin")
    }
});

router.post("/settings", ensureAdmin, async (req, res) => {
    try {
        const { password, password2 } = req.body;
        if (!password || !password2) {
            req.flash("error_msg", "Enter new password");
            return res.redirect(303,"/admin/settings");
        }
        if (password.length < 8) {
            req.flash("error_msg", "Password should be at least 8 characters long");
            return res.redirect(303,"/admin/settings")
        }

        if (password !== password2) {
            req.flash("error_msg", "Passwords do not match");
            return res.redirect(303,"/admin/settings");
        }

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(password, salt);

        await User.updateOne({ email: req.user.email }, { password: hash })
        req.flash("success_msg", "Password updated successfully");
        return res.redirect(303,"/admin/settings");
    } catch (err) {
        return res.redirect(303,"/admin")
    }
});

router.post("/credit-user/:client_id", ensureAdmin, async (req, res) => {
    try {
        const { client_id } = req.params;
        const { amount } = req.body;
        const user = await User.findById(client_id);
        if (!user) {
            req.flash("error_msg", "User with that Id not found");
            return res.redirect(303,"/admin/edit-user/" + client_id)
        }
        const cleanAmount = Number(amount.trim());
        user.balance = Number(user.balance) + cleanAmount;

        const reference = uuid.v1().split("-").slice(0, 3).join("");

        const newHist = new History({
            type: "PROFIT",
            amount: cleanAmount,
            reference,
            userID: client_id,
            user,
            method: 'Company Deposit',
            status: 'approved'
        });

        await newHist.save();
        await user.save();

        req.flash("success_msg", "User credited successfully");
        return res.redirect(303,"/admin/edit-user/" + client_id);

    } catch (err) {
        console.log(err);
        req.flash("error_msg", "internal server error");
        return res.redirect(303,"/admin/edit-user/" + req.params.client_id);
    }
})

router.post("/deposit-user/:client_id", ensureAdmin, async (req, res) => {
    try {
        const { client_id } = req.params;
        const { amount } = req.body;
        const user = await User.findById(client_id);
        if (!user) {
            req.flash("error_msg", "User with that Id not found");
            return res.redirect(303,"/admin/edit-user/" + client_id)
        }
        const cleanAmount = Number(amount.trim());
        user.balance = Number(user.balance) + cleanAmount;

        const reference = uuid.v1().split("-").slice(0, 3).join("");

        const newHist = new History({
            type: "DEPOSIT",
            amount: cleanAmount,
            reference,
            userID: client_id,
            user,
            method: 'Company Deposit',
            status: 'approved'
        });

        await newHist.save();
        await user.save();

        req.flash("success_msg", "Account Deposit successfully");
        return res.redirect(303,"/admin/edit-user/" + client_id);

    } catch (err) {
        console.log(err);
        req.flash("error_msg", "internal server error");
        return res.redirect(303,"/admin/edit-user/" + req.params.client_id);
    }
})

router.get("/approve-deposit/:reference", ensureAdmin, async (req, res) => {
    try {
        const { reference } = req.params;
        const dep = await Deposit.findOne({ reference });
        const user = await User.findById(dep.userID);
        await Deposit.updateOne({ reference }, { status: "approved" });
        await History.updateOne({ reference }, { status: "approved" });
        await User.updateOne({ _id: dep.userID }, {
            balance: Number(user.balance) + Number(dep.amount),
            invested: Number(user.invested) + Number(dep.amount)
        });
        req.flash("success_msg", "Deposit Approved");
        return res.redirect(303,"/admin");
    } catch (err) {
        return res.redirect(303,"/admin")
    }
});

router.get("/reject-deposit/:reference", ensureAdmin, async (req, res) => {
    try {
        const { reference } = req.params;
        await Deposit.updateOne({ reference }, { status: "rejected" })
        await History.updateOne({ reference }, { status: "rejected" })
        req.flash("success_msg", "Deposit Rejected");
        return res.redirect(303,"/admin");
    } catch (err) {
        return res.redirect(303,"/admin")
    }
});

router.get("/approve-withdrawal/:reference", ensureAdmin, async (req, res) => {
    try {
        const { reference } = req.params;
        await Withdraw.updateOne({ reference }, { status: "approved" })
        await History.updateOne({ reference }, { status: "approved" })
        req.flash("success_msg", "Withdrawal Approved");
        return res.redirect(303,"/admin");
    } catch (err) {
        console.log(err);
        return res.redirect(303,"/admin")
    }
});


router.get("/reject-withdrawal/:reference", ensureAdmin, async (req, res) => {
    try {
        const { reference } = req.params;
        const withd = await Withdraw.findOne({ reference });
        const user = await User.findById(withd.userID);
        await Withdraw.updateOne({ reference }, { status: "rejected" });
        await History.updateOne({ reference }, { status: "rejected" });
        await User.updateOne({ _id: withd.userID }, {
            balance: Number(user.balance) + Number(withd.amount)
        });
        req.flash("success_msg", "Withdrawal Rejected");
        return res.redirect(303,"/admin");
    } catch (err) {
        return res.redirect(303,"/admin")
    }
});


router.get("/delete-account/:clientID", ensureAdmin, async (req, res) => {
    try {
        const { clientID } = req.params;
        await User.deleteOne({ _id: clientID });
        req.flash("success_msg", "Account Deleted Succesfully");
        return res.redirect(303,"/admin");
    } catch (err) {
        return res.redirect(303,"/admin")
    }
});

router.get("/edit-user/:id", ensureAdmin, async (req, res) => {
    try {
        const userID = req.params.id;
        const client = await User.findById(userID);
        return res.render("admin/editUser", { req, res, client, layout: "layout3" });
    } catch (err) {
        return res.redirect(303,"/admin")
    }
});


router.post("/edit-user/:id", ensureAdmin, async (req, res) => {
    try {
        const {
            firstname,
            lastname,
            email,
            balance,
            invested,
            upgrade,
            disabled,
            accountLevel,
            cot,
            phone,
            currency,
            withdrawalPin
        } = req.body;

        const userID = req.params.id;

        await User.updateOne({ _id: userID }, {
            firstname,
            lastname,
            email,
            balance,
            invested,
            disabled,
            accountLevel,
            upgrade,
            cot,
            phone,
            currency,
            withdrawalPin
        })

        req.flash("success_msg", "Client Account updated successfully");

        return res.redirect(303,"/admin/edit-user/" + userID)
    } catch (err) {
        return res.redirect(303,"/admin")
    }
});

router.post("/generate-history/:client_id", ensureAdmin, async (req, res) => {
    try {
        const { client_id } = req.params;
        const {
            startDate,
            endDate,
            minAmount,
            maxAmount,
            startingBalance,
            endingBalance,
            transactionCount,
            includeProfits
        } = req.body;

        const user = await User.findById(client_id);
        if (!user) {
            req.flash("error_msg", "User not found");
            return res.redirect(303,"/admin/edit-user/" + client_id);
        }

        // Parse values
        const start = new Date(startDate);
        const end = new Date(endDate);
        const minAmt = Number(minAmount);
        const maxAmt = Number(maxAmount);
        const startBal = Number(startingBalance);
        const endBal = Number(endingBalance);
        const txCount = Number(transactionCount);
        const includeProfitTx = includeProfits === "true";

        // Validation
        if (start >= end) {
            req.flash("error_msg", "Start date must be before end date");
            return res.redirect(303,"/admin/edit-user/" + client_id);
        }
        if (minAmt > maxAmt) {
            req.flash("error_msg", "Min amount cannot be greater than max amount");
            return res.redirect(303,"/admin/edit-user/" + client_id);
        }

        // Generate random date within range
        const generateRandomDate = (startDate, endDate) => {
            const startTime = startDate.getTime();
            const endTime = endDate.getTime();
            return new Date(startTime + Math.random() * (endTime - startTime));
        };

        // Generate random amount within range
        const generateRandomAmount = (min, max) => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        // Calculate total balance change needed
        const totalBalanceChange = endBal - startBal;
        
        // Payment methods for variety
        const paymentMethods = ["Bitcoin", "Ethereum", "USDT", "Bank Transfer"];

        let allTransactions = [];
        let totalDeposits = 0;
        let totalProfits = 0;

        if (includeProfitTx) {
            // Deposits = ~20% of total, Profits = ~80% of total
            const depositAmount = Math.floor(totalBalanceChange * 0.2);
            const profitAmount = totalBalanceChange - depositAmount;

            // Split transactions: ~40% deposits, ~60% profits
            const depositTxCount = Math.max(1, Math.floor(txCount * 0.4));
            const profitTxCount = txCount - depositTxCount;

            // Generate deposit transactions
            let remainingDeposit = depositAmount;
            for (let i = 0; i < depositTxCount; i++) {
                let amount;
                if (i === depositTxCount - 1) {
                    amount = remainingDeposit;
                } else {
                    const avgAmount = Math.ceil(remainingDeposit / (depositTxCount - i));
                    const variance = Math.min(avgAmount * 0.5, maxAmt - minAmt);
                    amount = Math.max(minAmt, Math.min(maxAmt, avgAmount + Math.floor(Math.random() * variance * 2) - variance));
                    amount = Math.min(amount, remainingDeposit);
                }
                
                if (amount > 0) {
                    allTransactions.push({
                        type: "DEPOSIT",
                        amount,
                        date: generateRandomDate(start, end),
                        method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
                    });
                    remainingDeposit -= amount;
                    totalDeposits += amount;
                }
            }

            // Generate profit transactions (larger amounts)
            let remainingProfit = profitAmount;
            for (let i = 0; i < profitTxCount; i++) {
                let amount;
                if (i === profitTxCount - 1) {
                    amount = remainingProfit;
                } else {
                    const avgAmount = Math.ceil(remainingProfit / (profitTxCount - i));
                    const variance = Math.floor(avgAmount * 0.5);
                    amount = Math.max(1, avgAmount + Math.floor(Math.random() * variance * 2) - variance);
                    amount = Math.min(amount, remainingProfit);
                }
                
                if (amount > 0) {
                    allTransactions.push({
                        type: "PROFIT",
                        amount,
                        date: generateRandomDate(start, end),
                        method: "Trading Profit"
                    });
                    remainingProfit -= amount;
                    totalProfits += amount;
                }
            }
        } else {
            // Only deposits
            let remainingAmount = totalBalanceChange;
            for (let i = 0; i < txCount; i++) {
                let amount;
                if (i === txCount - 1) {
                    amount = remainingAmount;
                } else {
                    const maxPossible = Math.min(maxAmt, remainingAmount - (txCount - i - 1) * minAmt);
                    const minPossible = Math.max(minAmt, Math.ceil(remainingAmount / (txCount - i)));
                    
                    if (maxPossible < minPossible) {
                        amount = Math.max(minAmt, Math.floor(remainingAmount / (txCount - i)));
                    } else {
                        amount = generateRandomAmount(Math.max(minAmt, minPossible), Math.min(maxAmt, maxPossible));
                    }
                    amount = Math.min(amount, remainingAmount);
                }
                
                if (amount > 0) {
                    allTransactions.push({
                        type: "DEPOSIT",
                        amount,
                        date: generateRandomDate(start, end),
                        method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
                    });
                    remainingAmount -= amount;
                    totalDeposits += amount;
                }
            }
        }

        // Sort by date
        allTransactions.sort((a, b) => a.date - b.date);

        // Ensure deposits come first by moving first few deposits to the beginning
        if (includeProfitTx) {
            const deposits = allTransactions.filter(t => t.type === "DEPOSIT");
            const profits = allTransactions.filter(t => t.type === "PROFIT");
            
            // Take first 2-3 deposits and put them at the start
            const initialDeposits = deposits.slice(0, Math.min(3, deposits.length));
            const remainingDeposits = deposits.slice(Math.min(3, deposits.length));
            const otherTransactions = [...remainingDeposits, ...profits];
            
            // Sort remaining by date and mix them
            otherTransactions.sort((a, b) => a.date - b.date);
            
            // Assign sequential dates to initial deposits at the start
            const dayGap = (end - start) / (allTransactions.length + 1);
            initialDeposits.forEach((tx, idx) => {
                tx.date = new Date(start.getTime() + dayGap * (idx + 1));
            });
            
            allTransactions = [...initialDeposits, ...otherTransactions];
        }

        // Save all transactions
        for (const tx of allTransactions) {
            const reference = uuid.v4().split("-").slice(0, 3).join("");

            const newHistory = new History({
                type: tx.type,
                amount: tx.amount,
                reference,
                userID: client_id,
                user: user,
                method: tx.method,
                status: "approved",
                date: tx.date
            });

            await newHistory.save();

            // Also create Deposit record for deposit transactions
            if (tx.type === "DEPOSIT") {
                const newDeposit = new Deposit({
                    amount: tx.amount,
                    reference,
                    userID: client_id,
                    user: user,
                    method: tx.method,
                    status: "approved",
                    date: tx.date
                });
                await newDeposit.save();
            }
        }

        // Update user balance and invested amount
        // invested = total deposits (max 20% of total balance when profits included)
        await User.updateOne({ _id: client_id }, {
            balance: endBal,
            invested: totalDeposits
        });

        req.flash("success_msg", `Successfully generated ${allTransactions.length} transactions (${includeProfitTx ? `Deposits: $${totalDeposits}, Profits: $${totalProfits}` : `Deposits: $${totalDeposits}`}). Balance set to $${endBal}`);
        return res.redirect(303,"/admin/edit-user/" + client_id);

    } catch (err) {
        console.error("Generate history error:", err);
        req.flash("error_msg", "Error generating history: " + err.message);
        return res.redirect(303,"/admin/edit-user/" + req.params.client_id);
    }
});

router.post("/clear-history/:client_id", ensureAdmin, async (req, res) => {
    try {
        const { client_id } = req.params;

        const user = await User.findById(client_id);
        if (!user) {
            req.flash("error_msg", "User not found");
            return res.redirect(303,"/admin");
        }

        // Delete all history and deposits for this user
        await History.deleteMany({ userID: client_id });
        await Deposit.deleteMany({ userID: client_id });
        await Withdraw.deleteMany({ userID: client_id });

        // Reset user balances
        await User.updateOne({ _id: client_id }, {
            balance: 0,
            invested: 0
        });

        req.flash("success_msg", "Account history cleared and balances reset to zero");
        return res.redirect(303,"/admin/edit-user/" + client_id);

    } catch (err) {
        console.error("Clear history error:", err);
        req.flash("error_msg", "Error clearing history: " + err.message);
        return res.redirect(303,"/admin/edit-user/" + req.params.client_id);
    }
});


module.exports = router;