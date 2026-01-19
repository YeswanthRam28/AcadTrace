-- AcadTrace Triggers and Functions

-- Function to handle seat management and registration history
CREATE OR REPLACE FUNCTION handle_registration()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Check if seats are available
        IF (SELECT seats_available FROM offerings WHERE id = NEW.offering_id) <= 0 THEN
            RAISE EXCEPTION 'No seats available for this offering';
        END IF;

        -- Decrement seats
        UPDATE offerings
        SET seats_available = seats_available - 1
        WHERE id = NEW.offering_id;

        -- Log history
        INSERT INTO registration_history (student_id, offering_id, action)
        VALUES (NEW.student_id, NEW.offering_id, 'REGISTERED');

    ELSIF (TG_OP = 'UPDATE') THEN
        -- Handle status change from registered to dropped
        IF (OLD.status = 'registered' AND NEW.status = 'dropped') THEN
            UPDATE offerings
            SET seats_available = seats_available + 1
            WHERE id = NEW.offering_id;

            INSERT INTO registration_history (student_id, offering_id, action)
            VALUES (NEW.student_id, NEW.offering_id, 'DROPPED');
        END IF;

        -- Log grade change
        IF (OLD.grade IS DISTINCT FROM NEW.grade) THEN
            INSERT INTO grade_history (registration_id, old_grade, new_grade)
            VALUES (NEW.id, OLD.grade, NEW.grade);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for registrations
CREATE TRIGGER trg_registration_handler
AFTER INSERT OR UPDATE ON registrations
FOR EACH ROW
EXECUTE FUNCTION handle_registration();
