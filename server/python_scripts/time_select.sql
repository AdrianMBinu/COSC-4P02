-- select over the latest 10 for average
WITH total_time_sec AS (
    SELECT 
        AVG(TIMESTAMPDIFF(SECOND, start, end)) AS seconds 
    FROM summaries 
    ORDER BY start DESC
    LIMIT 10
), 
differences AS (
    SELECT 
        seconds,
        MOD(seconds, 60) AS seconds_part, 
        MOD(seconds, 3600) AS minutes_part, 
        MOD(seconds, 3600 * 24) AS hours_part 
    FROM total_time_sec
)

SELECT 
    FLOOR(seconds / 3600 / 24) as days,
    FLOOR(hours_part / 3600) as hours,
    FLOOR(minutes_part / 60) as minutes,
    seconds_part as seconds
FROM differences;


-- just select the last 10
WITH total_time_sec AS (
    SELECT 
        TIMESTAMPDIFF(SECOND, start, end) AS seconds 
    FROM summaries 
    ORDER BY start DESC
    LIMIT 10
), 
differences AS (
    SELECT 
        seconds,
        MOD(seconds, 60) AS seconds_part, 
        MOD(seconds, 3600) AS minutes_part, 
        MOD(seconds, 3600 * 24) AS hours_part 
    FROM total_time_sec
)

SELECT 
    FLOOR(seconds / 3600 / 24) as days,
    FLOOR(hours_part / 3600) as hours,
    FLOOR(minutes_part / 60) as minutes,
    seconds_part as seconds
FROM differences;