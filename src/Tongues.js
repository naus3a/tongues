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

    makeBody(){
        return{
            "model": this.model,
            "messages": [
                {
                    "role":"system",
                    "content":this.systemPrompt
                },
                {
                    "role":"user",
                    "content":this.userPrompt
                }
            ],
            "max_tokens":this.maxTokens,
            "temperature":this.temperature,
            "top_p":this.top_p,
            "search_domain_filter":this.searchDomainFilter,
            "return_images":this.returnImages,
            "return_related_questions":this.returnRelatedQuestions,
            "search_recency_filter":this.searchRecensyFilter,
            "top_k":this.top_k,
            "stream":this.stream,
            "presence_penalty":this.presencePenalty,
            "frequency_penalty":this.frequencyPenalty,
            "response_format":this.responseFormat
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

    async requestCompletion(){
        fetch('https://api.perplexity.ai/chat/completions', this.makeOptions())
        .then(response => response.json())
        .then(response => this.handleResponseCallbacks(response))
        .catch(err => console.error(err));
    }

    ///
    /// utils
    ///

    stripThinking(txt){
        const thinkCloseTag = "</think>"; 
        let pos = txt.search(thinkCloseTag);
        if(pos==-1){
            return txt;
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