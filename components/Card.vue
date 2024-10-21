<template>
    <div class="card">
        <header class="my-header">
            <slot name="header"></slot>
        </header>
        <slot></slot>
        <footer class="my-footer">
            <slot name="footer"></slot>
        </footer>
    </div>
</template>

<script setup>

</script>

<style scoped>
    .card{
        background-color: #e6e6e6;
        border-radius: 20px;
        padding: 20px;
        margin: 5px 0;
    }
</style>