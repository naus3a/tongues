class Tongues{
    constructor(apiKey){
        this.apiKey = apiKey;
        this.model = "r1-1776";
        this.systemPrompt = "Be precise and concise.";
        this.userPrompt = "How many stars are there in our galaxy?";
        this.maxTokens = 500;
        this.temperature = 0.2;
        this.top_p = 0.9;
        this.searchDomainFilter=null;
        this.returnImages = false;
        this.returnRelatedQuestions = false;
        this.searchRecensyFilter = "<string>";
        this.top_k=0;
        this.stream=false;
        this.presencePenalty=0;
        this.frequencyPenalty=1;
        this.responseFormat = null;

        this.responseListeners  = [];
    }

    ///
    /// api
    ///

    makeAuthorization(){
        return 'Bearer '+this.apiKey;
    }

    makeHeaders(){
        return {
            Authorization: this.makeAuthorization(),
            'Content-Type': 'application/json'
          }
    }

    makeBodyMessage(theRole, theContent){
        return{
            role: theRole,
            content: theContent
        }
    }

    makeBody(){
        return{
            temperature: this.temperature,
            top_p: this.top_p,
            return_images: this.returnImages,
            return_related_questions: this.returnRelatedQuestions,
            top_k: this.top_k,
            stream: this.stream,
            presence_penalty: this.presencePenalty,
            frequency_penalty: this.frequencyPenalty,
            web_search_options:{
                search_context_size: this.search_context_size
            },
            model: this.model,
            messages:[
                this.makeBodyMessage("system", this.systemPrompt),
                this.makeBodyMessage("user", this.userPrompt)
            ]
        }
    }

    makeOptions(){
        return {
            method: 'POST',
            headers: {
                Authorization: this.makeAuthorization(), 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.makeBody())
        };
    }

    async requestCompletion(newUserPrompt=undefined){
        if(newUserPrompt!=undefined){
            this.userPrompt = newUserPrompt;
        }
        try{
            const response = await fetch('https://api.perplexity.ai/chat/completions', this.makeOptions());
            if(!response.ok){
                const errData = await response.json();
                console.error(errData);
                return;
            }
            const data = await response.json();
            this.handleResponseCallbacks(data);
        }catch(err){
            console.error(err);
        }
    }

    ///
    /// utils
    ///

    stripThinking(txt){
        const thinkOpenTag = "<think>"
        const thinkCloseTag = "</think>"; 
        let pos = txt.search(thinkCloseTag);
        if(pos==-1){
            pos = txt.search(thinkOpenTag)
            if(pos==-1){
                return txt;
            }else{
                console.log("Tongues error: I only got the beginning of a thinking block");
                return "";
            }
        }
        pos += thinkCloseTag.length;
        return txt.substring(pos);
    }

    ///
    /// callbacks
    ///

    addResponseListener(callback){
        this.responseListeners.push(callback);
    }

    handleResponseCallbacks(response){
        const assistantMsg = response.choices[0].message.content;
        const assistantMsgNoThinking = this.stripThinking(assistantMsg);
        for(let i=0;i<this.responseListeners.length;i++){
            this.responseListeners[i](assistantMsgNoThinking);
        }
    }
}