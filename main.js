const CORE_ATTEMPTS_TO_CHECK = 5;
const CORE_CHECK_TIME_INTERVAL_SECS = 1;

const USER_AUTO_START_EPISODE = true;

const next_episode_class_name = "there_is_link_to_next_episode";
const button_of_suggest_class_name = "vjs-overlay-skip-intro";
const button_of_suggest_title = "Перейти к следующему эпизоду";
const hiddeness_class_name = "vjs-hidden";
const player_id_name = "my-player";
const player_big_button_class_name = "vjs-big-play-button";

let link_to_the_next_episode = undefined;
let buttons_of_suggest = [];
let player = undefined;
let player_big_button = undefined;
let watchers = [];

class ClassWatcher {
    constructor(targetNode, classToWatch, classAddedCallback, classRemovedCallback) {
        this.targetNode = targetNode
        this.classToWatch = classToWatch
        this.classAddedCallback = classAddedCallback
        this.classRemovedCallback = classRemovedCallback
        this.observer = null
        this.lastClassState = targetNode.classList.contains(this.classToWatch)

        this.init()
    }

    init() {
        this.observer = new MutationObserver(this.mutationCallback)
        this.observe()
    }

    observe() {
        this.observer.observe(this.targetNode, { attributes: true })
    }

    disconnect() {
        this.observer.disconnect()
    }

    mutationCallback = mutationsList => {
        for(let mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                let currentClassState = mutation.target.classList.contains(this.classToWatch)
                if(this.lastClassState !== currentClassState) {
                    this.lastClassState = currentClassState
                    if(currentClassState) {
                        this.classAddedCallback()
                    }
                    else {
                        this.classRemovedCallback()
                    }
                }
            }
        }
    }
}

function go_to_next() {
	document.location.replace(link_to_the_next_episode);
}

function core_init() {
	link_to_the_next_episode = document.getElementsByClassName(next_episode_class_name);
	if (link_to_the_next_episode === undefined)
		throw "No link";
	link_to_the_next_episode = link_to_the_next_episode[0].href;
	
	let buttons_of_suggest_collection = document.getElementsByClassName(button_of_suggest_class_name);
	if (buttons_of_suggest_collection === undefined)
		throw "No buttons";
	
	// need to check title to accept right buttons
	for (let butt of buttons_of_suggest_collection) {
		if (butt.title !== button_of_suggest_title)
			continue;
		buttons_of_suggest.push(butt);
	}
	if (buttons_of_suggest.length === 0)
		throw "No right buttons";
	
	player = document.getElementById(player_id_name);
	if (player === undefined)
		throw "No player";
	
	player_big_button = player.getElementsByClassName(player_big_button_class_name)[0];
	if (player_big_button === undefined)
		throw "No big start button";
}

function plugin_run() {
	for (let butt of buttons_of_suggest) {
		watchers.push(new ClassWatcher(butt, hiddeness_class_name, () => {console.log('add')}, go_to_next));
	}
	
	if (USER_AUTO_START_EPISODE === true)
		player_big_button.click();
}

function init() {
	let attempts = 0;
	let intervalID = setInterval(function () {
		try {
			core_init();
			console.log("INIT IS SUCCEED");
			plugin_run();
			window.clearInterval(intervalID);
		} catch (e) {
			console.log("Error: " + e + "; Attempt: " + attempts);
		}
		
		if (++attempts === CORE_ATTEMPTS_TO_CHECK) {
			console.log("Too many attempts;");
			window.clearInterval(intervalID);
		}
	}, CORE_CHECK_TIME_INTERVAL_SECS * 1000);
}

try {
	init();
} catch (e) {
	console.log(e);
}

function handleClick(cb) {
	console.log("Clicked, new value = " + cb.checked);
}