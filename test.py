import requests

headers = {
    'authority': 'www.douyin.com',
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'zh-CN,zh;q=0.9',
    'cache-control': 'no-cache',
    'cookie': '__ac_nonce=0653b7b47006a98261bc9; __ac_signature=_02B4Z6wo00f01D5PE9wAAIDDa82YQAUDzoQ-bxdAAGqv11; ttwid=1%7CHXCm1a7qtlmJdSt15RdteIYZ2IQTqKLXr9qHduEgGd8%7C1698397000%7C5d9a2f21f61a519525d813b9cbe6a2ada002e5164f2045ac70071f268c538e11; douyin.com; device_web_cpu_core=16; device_web_memory_size=8; architecture=amd64; webcast_local_quality=null; home_can_add_dy_2_desktop=%220%22; stream_recommend_feed_params=%22%7B%5C%22cookie_enabled%5C%22%3Atrue%2C%5C%22screen_width%5C%22%3A1440%2C%5C%22screen_height%5C%22%3A900%2C%5C%22browser_online%5C%22%3Atrue%2C%5C%22cpu_core_num%5C%22%3A16%2C%5C%22device_memory%5C%22%3A8%2C%5C%22downlink%5C%22%3A10%2C%5C%22effective_type%5C%22%3A%5C%224g%5C%22%2C%5C%22round_trip_time%5C%22%3A50%7D%22; passport_csrf_token=cad1b5084b9d94290f7aae2362048d36; passport_csrf_token_default=cad1b5084b9d94290f7aae2362048d36; FORCE_LOGIN=%7B%22videoConsumedRemainSeconds%22%3A180%7D; VIDEO_FILTER_MEMO_SELECT=%7B%22expireTime%22%3A1699001802519%2C%22type%22%3A1%7D; strategyABtestKey=%221698397002.614%22; volume_info=%7B%22isUserMute%22%3Afalse%2C%22isMute%22%3Afalse%2C%22volume%22%3A0.5%7D; s_v_web_id=verify_lo8dq2ih_QwCYjjFv_o2J3_4D5E_8Gt9_4JmEQR5bKKp0; csrf_session_id=f063e5da7fb1df4c3a4564d5fd13dd5c; ttcid=0512d5591211446d9bcc64256782223d27; msToken=iLzYSF7jWzW181Kx7QrktarMGkIWaIMBS-2VStDmuAe91b45hTkJvlXG6wlayes0wo2ggS_VLOy0TMFIwHpX-KRHiKF4eGQK_1ZoLln6nuRkUGPgew==; bd_ticket_guard_client_data=eyJiZC10aWNrZXQtZ3VhcmQtdmVyc2lvbiI6MiwiYmQtdGlja2V0LWd1YXJkLWl0ZXJhdGlvbi12ZXJzaW9uIjoxLCJiZC10aWNrZXQtZ3VhcmQtcmVlLXB1YmxpYy1rZXkiOiJCSTJDczkzNkFtdE9NUjZqTEtaNDkybjB1YjhncDN6NFFxdzhoTmJYc3Mrb05tYWxDZ2ZlRXJLaFlkS0R3bUx3eFk1ZmF0SElTWU5RN1lldUxYZDJrZ3c9IiwiYmQtdGlja2V0LWd1YXJkLXdlYi12ZXJzaW9uIjoxfQ%3D%3D; tt_scid=bOLP5nfx5vlSR2FzgAU1LjFw8jsu4yD.dgSkxkOuBKV0hKiwX3ji3MyXr1aT7HYe92f4; download_guide=%222%2F20231027%2F0%22; IsDouyinActive=true; msToken=Qse9V0kyhKSDqeEudShB82fWbocWqbJhGYIqiB_ttK5m7wefWeJo9rRz7gCj_VjtTKlh3Rks-qgD3g9VM3ftehdUK6LgOqbcRAcYn3G5O8r1c7gFiA==',
    'pragma': 'no-cache',
    'referer': 'https://www.douyin.com/user/MS4wLjABAAAANwHuHpgAgTOCEkKQuL3bs-z3JZ2JVKwzyFyoGoh2TfQJWFREy3pYCjLrDeD2ErGR?vid=7291899908880108811',
    'sec-ch-ua': '"Chromium";v="118", "Microsoft Edge";v="118", "Not=A?Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.61',
}
query="https://www.douyin.com/aweme/v1/web/aweme/post/?device_platform=webapp&aid=6383&channel=channel_pc_web&sec_user_id=MS4wLjABAAAANwHuHpgAgTOCEkKQuL3bs-z3JZ2JVKwzyFyoGoh2TfQJWFREy3pYCjLrDeD2ErGR&max_cursor=1690945565000&locate_item_id=7291899908880108811&locate_query=false&show_live_replay_strategy=1&need_time_list=0&time_list_query=0&whale_cut_token=&cut_version=1&count=18&publish_video_strategy_type=2&pc_client_type=1&version_code=170400&version_name=17.4.0&cookie_enabled=true&screen_width=1440&screen_height=900&browser_language=zh-CN&browser_platform=Win32&browser_name=Edge&browser_version=118.0.2088.61&browser_online=true&engine_name=Blink&engine_version=118.0.0.0&os_name=Windows&os_version=10&cpu_core_num=16&device_memory=8&platform=PC&downlink=10&effective_type=4g&round_trip_time=50&webid=7294559525708252723&msToken="

xb = "DFSzs5VOcjxANGx8tYCcQjNSwbmH"
response = requests.get(
    "https://www.douyin.com/aweme/v1/web/aweme/post/?" + query + "&X-Bogus=" + xb,
    headers=headers,
)

print(response.text)
