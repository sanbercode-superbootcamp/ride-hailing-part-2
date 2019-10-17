# Ride Hailing Part 2

Simple service mesh to demonstrate distributed tracing functionality

## Assignment

1. Implementasikan kembali service `point` yang melakukan proyeksi jumlah point yang dimiliki rider. Tiap 1 KM rider mendapatkan 1 point

    Informasi point yang dimiliki rider dapat diakses dengan menggunakan endpoint berikut

    ```bash
    GET /point/:rider_id
    ```

    akan mengembalikan informasi berikut

    ```js
    {
      ok: true,
      points: 12
    }
    ```

2. Pada service `monitoring` tambahkan informasi point yang dimiliki oleh rider.

    ```bash
    /GET /report/:rider_id
    ```

    mengembalikan informasi berikut

    ```js
    {
      ok: true,
      points: 12,
      ...
    }
    ```

    > informasi poin diambil dengan melakukan `http` request ke service point.

3. Tambahkan `child span` pada endpoint `report` pada service `monitoring`, untuk request ke service `getPosition` dan `getPoint`, sehingga menghasilkan `graph` sebagai berikut

    ```bash
    - monitoring service > report
      - monitoring service > parsing_input
      - monitoring service > get_position
        - position service > parsing_input 
        - position service > read_database 
        - position service > encode output
      - monitoring service > get_movement_logs
        - tracker service > parsing_input 
        - tracker service > read_database 
        - tracker service > encode output
      - monitoring service > get_point
        - point service > parsing_input 
        - point service > read_database 
        - point service > encode output
      - monitoring service > encode output
    ```

4. Bonus, Optimasikan fungsi `getPosition`, `getMovementLogs` & `getPoint` sehingga ke-tiganya dapat dieksekusi dibawah `100ms`

