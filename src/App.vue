<template>
    <loading v-if="loading" />
    <codemirror-editor v-else />
</template>

<script>
import Loading from './components/Loading'
import CodemirrorEditor from './view/CodemirrorEditor'
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
    }
}

</script>

<style lang="scss" scoped>
</style>
