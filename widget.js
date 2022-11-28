// This widget uses the GoalsOverPeriod boilerplate; modified and used with permission from official StreamLabs widgets Github repo:
// https://github.com/StreamElements/widgets

let index, goal, fieldData, currency, userLocale, prevCount, timeout;
let totalAnimations = 10;
let animationCount = 0;

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
        console.log("load widget");
        fieldData = obj.detail.fieldData;
        goal = fieldData["goal"];
        userLocale = fieldData["userLocale"];
        currency = obj["detail"]["currency"]["code"];
        index = fieldData['eventType'] + "-" + fieldData['eventPeriod'];
        if (fieldData['eventType'] === "subscriber-points") {
            index = fieldData['eventType'];
        }
        let count = 0;
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
        updateGoal(count);
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
    console.log("update sesh")
    if (typeof obj["detail"]["session"][index] !== 'undefined') {
        if (fieldData['eventPeriod'] === 'goal' || fieldData['eventType'] === 'cheer' || fieldData['eventType'] === 'tip' || fieldData['eventType'] === 'subscriber-points') {
            count = obj["detail"]["session"][index]['amount'];
        } else {
            count = obj["detail"]["session"][index]['count'];
        }
    }
    updateGoal(count);
});

window.addEventListener('onEventReceived', function (obj) {
    console.log("event received")
    const listener = obj.detail.listener;
    const data = obj.detail.event;

    if (listener === 'bot:counter' && data.counter === "goal") {
        goal = data.value;
        setGoal();
        updateGoal(count);
    }
});


function updateGoal(count) {
    if (count === prevCount) return;
    if (count >= goal) {
        if (fieldData['autoIncrement'] > 0 && fieldData.onGoalReach === "increment") {
            goal += fieldData['autoIncrement'];
            setGoal();
            updateGoal(count);
            return;
        } else if (fieldData.onGoalReach === "reset") {
            fieldData.onGoalReach === "reset";
            count = count % goal;
        }
    }
    clearTimeout(timeout);
    prevCount = count;
   
    if (fieldData['eventType'] === 'tip') {
        if (count % 1) {
            count = count.toLocaleString(userLocale, {style: 'currency', currency: currency})
        } else {
            count = count.toLocaleString(userLocale, {minimumFractionDigits: 0, style: 'currency', currency: currency})
        }
    }
    $("#count").html(count);
    
    animateTree(count);
}

function animateTree(count) {
    if (animationCount <= (totalAnimations))  {
        let goalReachedPercentage = count/goal; 
        console.log("% of goal reached: ",Math.goalReachedPercentage * 100,"%");
        let groupsToAnimate = Math.min(Math.ceil(goalReachedPercentage * totalAnimations), totalAnimations);
        console.log("groups to animate: ",groupsToAnimate);

        for (let i = animationCount; i < groupsToAnimate; i++) {
            animationCount++;
            console.log("animating group "+i+" ",animationCount);

            if (animationCount === totalAnimations) {
                $("#tree-star").addClass("glow");
            } else {
                $(".anim-group"+animationCount).removeClass("hide").addClass("animate__animated animate__fadeIn");
            }            
        }
    }
}