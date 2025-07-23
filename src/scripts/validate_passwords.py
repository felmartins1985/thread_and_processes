import sys
import json
from datetime import datetime, timedelta

def validate_password_change(user):
    try:
        last_update = datetime.strptime(user["lastPasswordUpdateAt"], "%Y-%m-%dT%H:%M:%S.%fZ")

        needs_change = datetime.utcnow() - last_update > timedelta(days=30)

        user["needsPasswordChange"] = needs_change
        
        user.pop("id", None)
        
        return user
    except KeyError as e:
        sys.stderr.write(f"Missing key in user data: {e}\n")
        return None
    except ValueError as e:
        sys.stderr.write(f"Invalid date format in user data: {e}\n")
        return None

if __name__ == "__main__":
    for line in sys.stdin:
        try:
            user = json.loads(line)

            updated_user = validate_password_change(user)
            if updated_user:
                print(json.dumps(updated_user))
        except json.JSONDecodeError as e:
            sys.stderr.write(f"Invalid JSON: {e}\n")
