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
        this.amountInput = this.add.dom(80, 570).createFromCache("amountInput");
        this.amountInput.setDepth(1020)
        this.amountInput.setVisible(false)

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
                            this.Dialog.setText("Set the total amount of cash you have on hand")
                            this.dialogEvent = "setWallet"
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
                            this.wallet.data.set('amount', amount)
    
                            this.walletText = this.add.text(690, 30, '', { font: '22px Arial' })
                                .setScrollFactor(0, 0)
                                .setDepth(100)
                                .setText(this.wallet.data.get('amount'))
    
                            this.Dialog.setText("Out of the total amount of cash you have on hand, how much do you plan to set aside in your investments?", 1)
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
                            this.Dialog.setText("You don't have that much cash on hand!", 1)
                        } else {
                            // Create EndowusWallet
                            this.endowusWallet = this.add.image(635, 70, 'endowusWallet')
                                .setDisplaySize(100, 20)
                                .setScrollFactor(0, 0)
                                .setDepth(100)
                                .setDataEnabled()
                            this.endowusWallet.data.set('amount', amount)

                            this.endowusWalletText = this.add.text(690, 60, '', { font: '22px Arial' })
                                .setScrollFactor(0, 0)
                                .setDepth(100)
                                .setText(this.endowusWallet.data.get('amount'))

                            // Remove stated amount from Cash Wallet
                            this.updateWallet(-amount)

                            this.Dialog.setText("Make Investing a habit by setting up Recurring Investments! At the end of every game event, the amount will be automatically transferred from your cash wallet to your investments!", 1)
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
                            this.Dialog.setText("You don't have that much cash on hand!", 1)
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
                                
                            this.Dialog.setText("To adjust Recurring Investments, click the Icon on the top-left!", 1)
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
                            this.Dialog.setText("You don't have that much cash on hand!", 1)
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
                        this.Dialog.display(false);

                        // Start Next Event
                        eventsCenter.emit('changeEvent')
                    } else {
                        eventsCenter.emit('reenableObject', this.portfolio)
                        this.Dialog.display(false);
                    }
                    break

                case "script":
                    if (isSpace) {
                        this.scriptNumber += 1
                        if (this.script["event" + this.eventNumber]["script"][this.scriptNumber] != null) {
                            this.Dialog.setText(this.script["event" + this.eventNumber]["script"][this.scriptNumber], 1)
                        } else {
                            this.walletPercentage = 50
                            this.walletPercentageText.setText("Cash: " + this.walletPercentage + "%    Endowus: " + (100 - this.walletPercentage) + "%")
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

                default:
                    this.Dialog.display(false);
            }
        }
    }

    updateWallet(amount) {
        this.wallet.data.values.amount += amount
        this.walletText.setText(this.wallet.data.get('amount'))
    }

    updateEndowusWallet(amount) {
        this.endowusWallet.data.values.amount += amount
        this.endowusWalletText.setText(this.endowusWallet.data.get('amount'))
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

        this.Dialog.setText("The year has come to an end...\nBased on your recurring investments, $" + recurringInvestmentAmount + " has been transferred from your Cash wallet to your Investments!", 1)
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
        this.dialogEvent = "script", this.scriptNumber = 0
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
            this.walletPercentageText.setText("Cash: " + this.walletPercentage + "%    Endowus: " + (100 - this.walletPercentage) + "%")
        }
    }
}