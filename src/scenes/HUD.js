import Phaser from 'phaser'
import eventsCenter from './../EventsCenter'

export default class HUD extends Phaser.Scene
{
	constructor()
	{
		super('HUD')
	}

    create() {
        // Get script data preloaded from script.json
        this.script = this.cache.json.get('script');

        // Amount Input Form
        this.amountInput = this.add.dom(80, 570)
            .createFromCache("amountInput")
            .setDepth(1020)
            .setVisible(false)

        this.moreInfoBtn = this.add.image(725, 575, 'moreInfoBtn')
            .setInteractive( { useHandCursor: true } )
            .setScrollFactor(0, 0)
            .setDepth(1010)
            .setScale(0.5, 0.5)
            .setVisible(false)
        this.moreInfoBtn.on('pointerup', () => window.open(this.externalURL), this)

        // For Wallet Percentage Dialog
        this.walletPercentageText = this.add.text(20, 565, '', { font: '18px pressstart' })
            .setScrollFactor(0, 0)
            .setDepth(1010)

        this.dialogVisible = false

        // HUD scene is launched with Scene 0, run Introduction Event on launch
        this.introductionEvent()

        // Setup Event Listeners
        eventsCenter.on('selectPortfolio', this.selectPortfolio, this)
        eventsCenter.on('playEvent', this.playEvent, this)
        eventsCenter.on('gameOver', this.gameOver, this)

        eventsCenter.on('dialogManager', this.dialogManager, this)
        eventsCenter.on('walletPercentageManager', this.walletPercentageManager, this)

        // Create Miscellaneous Variables
        this.Dialog = this.Dialog
        this.recurringInvestmentTotal = 0
        this.interestEarnedTotal = 0
    }

    update() {
        if (this.Dialog.visible != this.dialogVisible) {
            this.dialogVisible = this.Dialog.visible
            eventsCenter.emit('dialogVisible', this.dialogVisible)
        }
    }

    introductionEvent() {
        this.Dialog.setText(this.script["introduction"]["script"][0], 1)
        this.dialogEvent = "introduction", this.scriptNumber = 0
        
    }

    selectPortfolio(portfolio) {
        this.Dialog.setText(this.script[portfolio.name]["script"][0], 1)
        this.dialogEvent = "selectPortfolio", this.scriptNumber = 0, this.portfolio = portfolio

        this.moreInfoBtn.setVisible(true)
        this.externalURL = this.script[this.portfolio.name]["externalURL"]
    }

    dialogManager(isSpace) {
        if (this.Dialog.visible) {
            switch(this.dialogEvent) {
                case "introduction":
                    if (isSpace) {
                        this.scriptNumber += 1
                        if (this.script["introduction"]["script"][this.scriptNumber] != null) {
                            this.Dialog.setText(this.script["introduction"]["script"][this.scriptNumber], 1)
                        } else {
                            this.amountInput.setVisible(true)
                            this.Dialog.setText("Set the total amount of savings you have on hand")
                            this.dialogEvent = "setWallet"
                        }

                        // Only show more info button at 2nd script
                        if (this.scriptNumber == 1) {
                            this.moreInfoBtn.setVisible(true)
                            this.externalURL = this.script["introduction"]["externalURL"]
                        } else {
                            this.moreInfoBtn.setVisible(false)
                        }
                    }
                    break
                
                case "setWallet":
                    if (isSpace) {
                        var amount = parseInt(this.amountInput.getChildByName("amountInput").value)
                        if (isNaN(amount) || amount < 1000) {
                            this.Dialog.setText("Please set an amount above $1,000!")
                        } else {
                            // Create Wallet
                            this.wallet = this.add.image(670, 40, 'wallet')
                                .setDisplaySize(48, 48)
                                .setScrollFactor(0, 0)
                                .setDepth(100)
                                .setDataEnabled()
                                .setInteractive( { useHandCursor: true } )
                                .on('pointerdown', () => { this.changeWallet() })
                            this.wallet.data.set('amount', amount)
    
                            this.walletText = this.add.text(690, 30, '', { font: '22px Arial' })
                                .setScrollFactor(0, 0)
                                .setDepth(100)
                                .setText(this.wallet.data.get('amount'))
    
                            this.Dialog.setText("Out of the total amount of savings you have on hand, how much do you plan to set aside in your investments? You may transfer funds between the two wallets at any time by clicking on the relevant wallet!", 1)
                            this.dialogEvent = "setEndowusWallet"
                            this.amountInput.getChildByName("amountInput").value = ""
                        }
                    }
                    break

                case "setEndowusWallet": 
                    if (isSpace) {
                        var amount = parseInt(this.amountInput.getChildByName("amountInput").value)
                        if (isNaN(amount)) {
                            amount = 0
                        }

                        if (amount > this.wallet.data.values.amount) {
                            this.Dialog.setText("You don't have that much savings on hand!", 1)
                        } else {
                            // Create EndowusWallet
                            this.endowusWallet = this.add.image(635, 70, 'endowusWallet')
                                .setDisplaySize(100, 20)
                                .setScrollFactor(0, 0)
                                .setDepth(100)
                                .setDataEnabled()
                                .setInteractive( { useHandCursor: true } )
                                .on('pointerdown', () => { this.changeEndowusWallet() })
                            this.endowusWallet.data.set('amount', amount)

                            this.endowusWalletText = this.add.text(690, 60, '', { font: '22px Arial' })
                                .setScrollFactor(0, 0)
                                .setDepth(100)
                                .setText(this.endowusWallet.data.get('amount'))

                            // Remove stated amount from Savings Wallet
                            this.updateWallet(-amount)

                            this.Dialog.setText("Make Investing a habit by setting up Recurring Investments! At the end of every game event, the amount will be automatically transferred from your savings wallet to your investments!", 1)
                            this.dialogEvent = "setRecurring"
                            this.amountInput.getChildByName("amountInput").value = ""
                        }
                    }
                    break

                case "setRecurring":
                    if (isSpace) {
                        var amount = parseInt(this.amountInput.getChildByName("amountInput").value)
                        if (isNaN(amount)) {
                            amount = 0
                        }
    
                        if (amount > this.wallet.data.values.amount) {
                            this.Dialog.setText("You don't have that much savings on hand!", 1)
                        } else {
                            // Create Recurring Investments
                            this.recurringInvestment = this.add.image(40, 40, 'recurringInvestment')
                                .setDisplaySize(32, 32)
                                .setScrollFactor(0, 0)
                                .setDepth(100)
                                .setDataEnabled()
                                .setInteractive( { useHandCursor: true } )
                                .on('pointerdown', () => { this.changeRecurringInvestment() })
                            this.recurringInvestment.data.set('amount', amount)
    
                            this.recurringInvestmentText = this.add.text(70, 30, '', { font: '22px Arial' })
                                .setScrollFactor(0, 0)
                                .setDepth(100)
                                .setText(this.recurringInvestment.data.get('amount'))
                                
                            this.Dialog.setText("To adjust Recurring Investments, click the Icon on the top-left!\nBefore you begin, the game will automatically end when both wallets reach $0! Funds will be transferred across wallets as needed", 1)
                            this.amountInput.setVisible(false)
                            this.dialogEvent = ""
                            this.amountInput.getChildByName("amountInput").value = ""
                        }
                    }
                    break

                case "changeWallet":
                    if (isSpace) {
                        var amount = parseInt(this.amountInput.getChildByName("amountInput").value)
                        if (isNaN(amount)) {
                            amount = 0
                        }

                        if (amount > this.wallet.data.values.amount) {
                            this.Dialog.setText("You don't have that much savings on hand to transfer!", 1)
                        } else {
                            this.updateWallet(-amount)
                            this.updateEndowusWallet(amount)

                            this.Dialog.display(false);
                            this.amountInput.setVisible(false)
                            this.dialogEvent = ""
                            this.amountInput.getChildByName("amountInput").value = ""
                        }
                    }
                    break

                case "changeEndowusWallet":
                    if (isSpace) {
                        var amount = parseInt(this.amountInput.getChildByName("amountInput").value)
                        if (isNaN(amount)) {
                            amount = 0
                        }

                        if (amount > this.endowusWallet.data.values.amount) {
                            this.Dialog.setText("You don't have that much investment on hand to transfer!", 1)
                        } else {
                            this.updateEndowusWallet(-amount)
                            this.updateWallet(amount)

                            this.Dialog.display(false);
                            this.amountInput.setVisible(false)
                            this.dialogEvent = ""
                            this.amountInput.getChildByName("amountInput").value = ""
                        }
                    }
                    break
                
                case "changeRecurring":
                    if (isSpace) {
                        var amount = parseInt(this.amountInput.getChildByName("amountInput").value)
                        if (isNaN(amount)) {
                            amount = 0
                        }

                        if (amount > this.wallet.data.values.amount) {
                            this.Dialog.setText("You don't have that much savings on hand!", 1)
                        } else {
                            this.recurringInvestment.data.set('amount', amount)
                            this.recurringInvestmentText.setText(this.recurringInvestment.data.get('amount'))

                            this.Dialog.display(false);
                            this.amountInput.setVisible(false)
                            this.dialogEvent = ""
                            this.amountInput.getChildByName("amountInput").value = ""
                        }
                    }
                    break

                case "selectPortfolio":
                    if (isSpace) {
                        this.scriptNumber += 1
                        // Close More Info Button
                        this.moreInfoBtn.setVisible(false)

                        if (this.script[this.portfolio.name]["script"][this.scriptNumber] != null) {
                            this.Dialog.setText(this.script[this.portfolio.name]["script"][this.scriptNumber], 1)
                        } else {
                            this.Dialog.setText("Do you want to select this portfolio?", 2)
                            this.dialogEvent = "selectPortfolioQuestion"
                        }
                    }
                    break

                case "selectPortfolioQuestion":
                    if (isSpace) {
                        this.annualisedReturn = this.script[this.portfolio.name]["annualisedReturn"]
                        this.volatility = this.script[this.portfolio.name]["volatility"]
                        this.riskTolerance = this.script[this.portfolio.name]["riskTolerance"]
                        this.Dialog.display(false);

                        // Start Next Event
                        eventsCenter.emit('changeEvent')
                    } else {
                        eventsCenter.emit('reenableObject', this.portfolio)
                        this.Dialog.display(false);
                    }
                    break

                // Normal Events
                case "script":
                    if (isSpace) {
                        this.scriptNumber += 1
                        if (this.script["event" + this.eventNumber]["script"][this.scriptNumber] != null) {
                            this.Dialog.setText(this.script["event" + this.eventNumber]["script"][this.scriptNumber], 1)
                        } else {
                            this.walletPercentage = 50
                            let amount = this.script["event" + this.eventNumber]["amount"]
                            let savingAmount = Math.round(amount * (this.walletPercentage / 100)), investmentAmount = Math.round(amount * (1 - this.walletPercentage / 100))
                            this.walletPercentageText.setText("Savings: $" + savingAmount + "    Endowus: $" + investmentAmount)
                            this.walletPercentageText.setVisible(true)
                            
                            this.Dialog.setText(this.script["event" + this.eventNumber]["question"], 3)
                            this.dialogEvent = "question"
                        }
                    }
                    break
                
                case "question":
                    if (isSpace) {
                        this.walletPercentageText.setVisible(false)
                        this.updateWallet(this.script["event" + this.eventNumber]["amount"] * (this.walletPercentage / 100))
                        this.updateEndowusWallet(this.script["event" + this.eventNumber]["amount"] * (1 - this.walletPercentage / 100))

                        if (this.wallet.data.values.amount == 0 && this.endowusWallet.data.values.amount == 0) {
                            this.Dialog.setText("You ran out of money!")
                            this.dialogEvent = ""
                            this.time.delayedCall(3000, this.gameOver, [], this)
                            return
                        }

                        this.Dialog.setText(this.script["event" + this.eventNumber]["response"], 1)
                        this.dialogEvent = ""
                        this.time.delayedCall(3000, this.calculateRecurringInvestment, [], this)
                    }
                    break

                case "recurringInvestment":
                    if (isSpace) {
                        this.calculateInterest()
                    }
                    break
                
                case "interest":
                    if (isSpace) {
                        this.dialogEvent = ""
                        this.Dialog.display(false);

                        eventsCenter.emit('changeEvent')
                    break
                    }

                // Volatility Events
                case "volatilityScript":
                    if (isSpace) {
                        this.scriptNumber += 1
                        if (this.script["event" + this.eventNumber]["script"][this.scriptNumber] != null) {
                            this.Dialog.setText(this.script["event" + this.eventNumber]["script"][this.scriptNumber], 1)
                        } else {
                            if (this.script["event" + this.eventNumber]["question"] != null) {
                                // Volatility Events immediately add a portion of invested amount based on Risk Tolerance
                                this.updateEndowusWallet(-this.riskTolerance, "percentage")

                                // Is a Debit event, ask volatility question
                                this.Dialog.setText(this.script["event" + this.eventNumber]["question"], 2)
                                this.dialogEvent = "volatilityQuestion"
                            } else {
                                // Volatility Events immediately add a portion of invested amount based on Risk Tolerance
                                this.updateEndowusWallet(this.riskTolerance, "percentage")

                                // Is a Credit event, no further statements needed
                                this.Dialog.display(false);
                                this.dialogEvent = ""
                                this.time.delayedCall(3000, () => eventsCenter.emit('changeEvent'), [], this)

                                
                            }
                        }
                    }
                    break
                
                case "volatilityQuestion":
                    if (isSpace) {
                        this.amountInput.setVisible(true)

                        this.Dialog.setText("How much would you like to withdraw from your investments?", 1)
                        this.dialogEvent = "volatilityAnswer"
                    } else {
                        // this.Dialog.setText("You have chosen to not withdraw your investments.", 1)
                        // this.dialogEvent = ""
                        // this.time.delayedCall(3000, () => eventsCenter.emit('changeEvent'), [], this)

                        this.Dialog.setText("Would you like to change your recurring investments?", 2)
                        this.dialogEvent = "volatilityRecurring"
                    }
                    break

                case "volatilityAnswer":
                    if (isSpace) {
                        var amount = parseInt(this.amountInput.getChildByName("amountInput").value)
                        if (isNaN(amount)) {
                            amount = 0
                        }

                        if (amount > this.endowusWallet.data.values.amount) {
                            this.Dialog.setText("You don't have that much savings in your investments!", 1)
                        } else {
                            // Transfer Amount from Investment to Savings
                            this.updateWallet(amount)
                            this.updateEndowusWallet(-amount)

                            if (this.wallet.data.values.amount == 0 && this.endowusWallet.data.values.amount == 0) {
                                this.Dialog.setText("You ran out of money!")
                                this.dialogEvent = ""
                                this.time.delayedCall(3000, this.gameOver, [], this)
                                return
                            }

                            this.amountInput.setVisible(false)

                            this.Dialog.setText("You have transferred $" + amount + " from your Investments to your Savings wallet! Would you like to change your recurring investments?" , 2)
                            this.dialogEvent = "volatilityRecurring"
                            this.amountInput.getChildByName("amountInput").value = ""
                        }
                    }
                    break

                case "volatilityRecurring":
                    if (isSpace) {
                        this.Dialog.display(false)
                        this.changeRecurringInvestment()
                    } else {
                        this.Dialog.display(false)
                        this.dialogEvent = ""
                    }
                    eventsCenter.emit('changeEvent')
                    break

                default:
                    this.Dialog.display(false);
            }
        }
    }

    updateWallet(amount) {  
        let walletAmount = this.wallet.data.values.amount
        let remaining = walletAmount + amount

        // If Wallet goes below 0, pay remaining with EndowusWallet
        if (remaining < 0) {
            this.wallet.data.values.amount = 0
            if (this.endowusWallet.data.values.amount != 0) {
                this.updateEndowusWallet(remaining)
            }
        } else {
            this.wallet.data.values.amount += amount
        }
        this.walletText.setText(this.wallet.data.get('amount'))
    }

    updateEndowusWallet(amount, type = "integer") {
        let endowusWalletAmount = this.endowusWallet.data.values.amount  
        let remaining;
        if (type == "integer") {
            remaining = endowusWalletAmount + amount
        } else if (type == "percentage") {
            remaining = Math.round(endowusWalletAmount * ((100 + amount)/100))
            this.endowusWallet.data.values.amount = remaining
            this.endowusWalletText.setText(this.endowusWallet.data.get('amount'))
            return
        }

        // If EndowusWallet goes below 0, pay remaining with Wallet
        if (remaining < 0) {
            this.endowusWallet.data.values.amount = 0
            if (this.wallet.data.values.amount != 0) {
                this.updateWallet(remaining)
            }
        } else {
            this.endowusWallet.data.values.amount += amount
        }
        this.endowusWalletText.setText(this.endowusWallet.data.get('amount'))
    }

    changeWallet() {
        // Only allow change if Dialog Box is not visible
        if (!this.Dialog.visible) {
            this.amountInput.setVisible(true)
            this.Dialog.setText("How much would you like to transfer from Savings to Investment?", 1)
            this.dialogEvent = "changeWallet"
        }
    }

    changeEndowusWallet() {
        // Only allow change if Dialog Box is not visible
        if (!this.Dialog.visible) {
            this.amountInput.setVisible(true)
            this.Dialog.setText("How much would you like to transfer from Investment to Savings?", 1)
            this.dialogEvent = "changeEndowusWallet"
        }
    }

    changeRecurringInvestment() {
        // Only allow change if Dialog Box is not visible
        if (!this.Dialog.visible) {
            this.amountInput.setVisible(true)
            this.Dialog.setText("Set the new Recurring Investment Amount!", 1)
            this.dialogEvent = "changeRecurring"
        }
    }

    calculateRecurringInvestment() {
        let recurringInvestmentAmount = this.recurringInvestment.data.get('amount')
        this.updateWallet(-recurringInvestmentAmount)
        this.updateEndowusWallet(recurringInvestmentAmount)
        this.recurringInvestmentTotal += recurringInvestmentAmount

        if (this.wallet.data.values.amount == 0 && this.endowusWallet.data.values.amount == 0) {
            this.Dialog.setText("You ran out of money!")
            this.dialogEvent = ""
            this.time.delayedCall(3000, this.gameOver, [], this)
            return
        }

        this.Dialog.setText("The year has come to an end...\nBased on your recurring investments, $" + recurringInvestmentAmount + " has been transferred from your Savings wallet to your Investments!", 1)
        this.dialogEvent = "recurringInvestment"
    }

    calculateInterest() {
        let returnsPercentage = ((Math.random() - 0) / (1 - 0)) * (this.volatility) + (this.annualisedReturn - this.volatility)
        let currentAmount = this.endowusWallet.data.values.amount
        let interestEarnedAmount = Math.round(currentAmount * (returnsPercentage / 100))

        this.updateEndowusWallet(interestEarnedAmount)
        this.interestEarnedTotal += interestEarnedAmount
        
        this.Dialog.setText("Your returns this year is " + returnsPercentage.toFixed(2) + "%. Total earnings: $" + interestEarnedAmount, 1)
        this.dialogEvent = "interest"
    }

    playEvent(eventNumber) {
        this.eventNumber = eventNumber
        this.Dialog.setText(this.script["event" + eventNumber]["script"][0], 1)

        // Normal events and Volatility events play out differently
        if (this.script["event" + eventNumber]["isVolatilityEvent"] == true) {
            this.dialogEvent = "volatilityScript", this.scriptNumber = 0
        } else {
            this.dialogEvent = "script", this.scriptNumber = 0
        }
    }

    gameOver() {
        this.Dialog.setText("The game has ended. Over the years, your Recurring Investments helped you save an additional $" + this.recurringInvestmentTotal + "! Total interest earned is $" + this.interestEarnedTotal + ".\n\nYou may proceed to close or restart the game. Thanks for playing!", 1)
        this.dialogEvent = ""
    }

    walletPercentageManager(isUp) {
        if (this.Dialog.visible && this.dialogEvent == "question") {
            if (isUp && this.walletPercentage < 100) {
                this.walletPercentage += 10
            } else if (!isUp && this.walletPercentage > 0) {
                this.walletPercentage -= 10
            }
            let amount = this.script["event" + this.eventNumber]["amount"]
            let savingAmount = Math.round(amount * (this.walletPercentage / 100)), investmentAmount = Math.round(amount * (1 - this.walletPercentage / 100))
            this.walletPercentageText.setText("Savings: $" + savingAmount + "    Endowus: $" + investmentAmount)
        }
    }
}