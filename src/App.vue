<template>
    <loading v-if="loading" />
    <codemirror-editor v-else />
</template>

<script>
import Loading from './components/Loading'
import CodemirrorEditor from './components/CodemirrorEditor'
export default {
    name: 'App',
    components: {
        Loading,
        CodemirrorEditor
    },
    data() {
        return {
            loading: true
        }
    },
    mounted() {
        setTimeout(() => {
            this.loading = false
        }, 200)
        window.console &&
            window.console.log &&
            (console.log("Think big, train fast, learn deep. See https://github.com/yanglbme"))
    }
}

</script>

<style lang="scss" scoped>
</style>
