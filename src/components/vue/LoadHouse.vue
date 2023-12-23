<template>
    <article v-if="html !== false" class="message is-info" style="margin-bottom: 15px">
        <div v-if="title" @click="toggleVisibility" class="message-header" style="cursor: pointer">
            <p>                
                {{ title }}
                <a v-if="link" :href="link" target="_blank" style="font-weight: normal">Visit</a>
            </p>
            <span class="fas" :class="visible ? 'fa-chevron-down' : 'fa-chevron-up'"></span>
        </div>
        <div :class="{ collapsed: !visible }" class="message-body content" v-html="html"></div>
        <div class="houselink">
            <a v-if="link" :href="link" target="_blank" style="font-weight: normal">{{ title }}</a>
        </div>
        <button v-if="!visible" @click="toggleVisibility" class="button show-button is-info">Show Text</button>
    </article>
    <div v-else class="loader is-loading" style="width: 50px; height: 50px; margin: 10px auto"></div>
</template>
  
<script>
export default {
    props: {
        house: {
            type: Object,
            default: () => ({}),
        },
        initVisible: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            visible: this.initVisible,
            html: '',
            title: '',
            link: '',
            name: '',
        };
    },
    mounted() {
        // TODO: check if already loaded
        this.loadHouseInfo();
    },
    methods: {
        loadHouseInfo() {
            this.html = this.house.html || '';
            this.title = this.house.title || '';
            this.link = this.house.link || '';
            this.name = this.house.name || '';
            if (this.$parent && this.$parent.windowData) {
                this.$parent.adjustHeight();
            }
        },
        toggleVisibility() {
            this.visible = !this.visible;
        },
    },
};
</script>
  
<style lang="scss" scoped>
.houselink {    
    margin: 20px;
    padding-bottom: 25px;

}
.message {
    position: relative;
}

.collapsed {
    max-height: 85px;
    overflow: hidden;
    mask: linear-gradient(#fff, transparent);
}

.show-button {
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
}
</style>
  