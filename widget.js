/* 
*********************
F2U Christmas Events Widget (JS)
*********************
Designed by Yamiyo (twitter.com/yamiyoukii)
Developed by Rhodeia (twitter.com/rhodeia_ch)

This widget uses the GoalsOverPeriod boilerplate; modified and used with permission from the official StreamElements widgets Github repo:
https://github.com/StreamElements/widgets
*/
let count, index, goal, fieldData, currency, userLocale, prevCount, selectedEventType;
let currentAnimation = 0;

const TOTAL_ANIMATIONS = 10;
const COUNT_START = 0;

function setGoal() {
    if (fieldData['eventType'] === 'tip') {
        if (goal % 1) {
            $("#goal").html(goal.toLocaleString(userLocale, {style: 'currency', currency: currency}));
        } else {
            $("#goal").html(goal.toLocaleString(userLocale, {
                minimumFractionDigits: 0,
                style: 'currency',
                currency: currency
            }));
        }
    } else {
        $("#goal").html(goal);
    }
}

window.addEventListener('onWidgetLoad', async function (obj) {
        fieldData = obj.detail.fieldData;
        goal = fieldData["goal"];
        userLocale = fieldData["userLocale"];
        currency = obj["detail"]["currency"]["code"];
        index = fieldData['eventType'] + "-" + fieldData['eventPeriod'];
        selectedEventType = fieldData['eventType'];
        if (fieldData['eventType'] === "subscriber-points") {
            index = fieldData['eventType'];
        }
        count = 0;
        if (typeof obj["detail"]["session"]["data"][index] !== 'undefined') {
            if (fieldData['eventPeriod'] === 'goal' || fieldData['eventType'] === 'cheer' || fieldData['eventType'] === 'tip' || fieldData['eventType'] === 'subscriber-points') {
                count = obj["detail"]["session"]["data"][index]['amount'];
            } else {
                count = obj["detail"]["session"]["data"][index]['count'];
            }
        }
        if (fieldData['botCounter']) {
            goal = await getCounterValue(obj.detail.channel.apiToken);
        }
        setGoal()
        updateCount(count);
    }
);

let getCounterValue = apiKey => {
    return new Promise(resolve => {
        fetch("https://api.streamelements.com/kappa/v2/channels/me", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "authorization": `apikey ${apiKey}`
            }, "method": "GET"
        }).then(response => response.json()).then(obj => {
            fetch(`https://api.streamelements.com/kappa/v2/bot/${obj._id}/counters/goal`).then(response => response.json()).then(data => {
                resolve(data.value)
            })
        });
    })
};


window.addEventListener('onSessionUpdate', function (obj) {
    if (typeof obj["detail"]["session"][index] !== 'undefined') {
        if (fieldData['eventPeriod'] === 'goal' || fieldData['eventType'] === 'cheer' || fieldData['eventType'] === 'tip' || fieldData['eventType'] === 'subscriber-points') {
            count = obj["detail"]["session"][index]['amount'];
        } else {
            count = obj["detail"]["session"][index]['count'];
        }
    }
    
    updateCount(count);
});

window.addEventListener('onEventReceived', function (obj) {
    const listener = obj.detail.listener;
    const data = obj.detail.event;

    if (listener === 'bot:counter' && data.counter === "goal") {
        goal = data.value;
        setGoal();
        updateCount(count);
    }

    if (data.listener === 'widget-button' && data.field === 'resetButton') {
        count = COUNT_START;
        updateCount(count);
        resetTree();
    }

    if (listener === 'event:test') {
        handleTestEvents(data);
    }
});

function handleTestEvents(data) {
    if (data?.event?.type === selectedEventType) {
        count += data.event.amount;
        updateCount(count);
    }
}

function updateCount(count) {
    if (count === prevCount) return;
    if (count >= goal) {
        if (fieldData['autoIncrement'] > 0 && fieldData.onGoalReach === "increment") {
            goal += fieldData['autoIncrement'];
            setGoal();
            updateCount(count);
            return;
        } else if (fieldData.onGoalReach === "reset") {
            fieldData.onGoalReach === "reset";
            count = count % goal;
            resetTree();
        }
    }
    prevCount = count;

    animateTree(count);
   
    if (fieldData['eventType'] === 'tip') {
        if (count % 1) {
            count = count.toLocaleString(userLocale, {style: 'currency', currency: currency})
        } else {
            count = count.toLocaleString(userLocale, {minimumFractionDigits: 0, style: 'currency', currency: currency})
        }
    }

    $("#count-text").html(`${count}`);
}

function animateTree(count) {
    if (currentAnimation <= TOTAL_ANIMATIONS)  {
        let goalReachedPercentage = count/goal;

        let groupsToAnimate = Math.min(Math.floor(goalReachedPercentage * TOTAL_ANIMATIONS), TOTAL_ANIMATIONS);

        for (let i = currentAnimation; i < groupsToAnimate; i++) {
            currentAnimation++;

            if (currentAnimation === TOTAL_ANIMATIONS) {
                $("#tree-star").addClass("glow");
            }  
            
            if (currentAnimation <= TOTAL_ANIMATIONS) {
                $(".anim-group"+currentAnimation).removeClass("hide").addClass("bounce");
            }            
        }
    }
}

function resetTree() { 
    currentAnimation = COUNT_START;
    $("#tree-star").removeClass("glow");
    $(".anim-group").removeClass("bounce").addClass("hide");
}