function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

class ApiCaller {
    #controller = new AbortController()
    constructor(api, repeatEvery_ms = 0) {
        this.api = api;
        this.msTime = repeatEvery_ms;
    }

    async callWithParamsFrom(selector, attribute, defaultLoadingElement = '<div class="loader"></div>') {
        let items = [...document.querySelectorAll(selector)]
        while (items.length > 0) {
            let batch = items.splice(0, 3)
            batch.map(async item => {
                try {
                    let req = await fetch(this.api + item.getAttribute(attribute), { signal: this.#controller.signal })
                    item.innerHTML = (await req.json()).data
                } catch (err) { //when abort is called
                    item.innerHTML = ''
                    if (this.#controller.signal.aborted) item.insertAdjacentHTML('beforeend', defaultLoadingElement)
                }
            })
            await sleep(210)
        }
        if (this.msTime == 0) return;
        await sleep(this.msTime)
        await this.callWithParamsFrom(selector, attribute, defaultLoadingElement)
    }

    stop() {
        this.#controller.abort();
    }
    resume() {
        this.#controller = new AbortController()
    }
}